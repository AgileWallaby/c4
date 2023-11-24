import { Element } from "./core"
import { Component } from "./component"
import { Container } from "./container"
import { Model } from "./model"
import { SoftwareSystem } from "./softwareSystem"
import { View, Views } from './views'

const INDENT_SIZE = 2

export class StructurizrDSLWriter {

  public constructor(private readonly model: Model, private readonly views: Views) {
  }

  private writeElement(elementType: string, element: Element, level: number, closeElement: boolean = true): string {
    let elementDsl = ""

    elementDsl += this.writeLine(`${element.canonicalName} = ${elementType} "${element.name}" {`, level)
    if (element.description) {
      elementDsl += this.writeLine(`description "${element.description}"`, level + 1)
    }
    elementDsl += this.writeLine(`tags ${element.tags.map(tag => `"${tag}"`).join(" ")}`, level + 1)
    if (closeElement) {
      elementDsl += this.writeLine(`}`, level)
    }
    return elementDsl
  }

  private writeComponent(component: Component, level: number): string {
    let componentDsl = ""

    componentDsl += this.writeElement("component", component, level, false)
    componentDsl += this.writeLine(`technology "${component.technology}"`, level + 1)
    componentDsl += this.writeLine(`}`, level)

    return componentDsl
  }

  private writeContainer(container: Container, level: number): string {
    let containerDsl = ""

    containerDsl += this.writeElement("container", container, level, false)
    containerDsl += this.writeLine(`technology "${container.technology}"`, level + 1)

    container.getChildElements().forEach((element) => {
      if (element instanceof Component) {
        containerDsl += this.writeComponent(element, level + 1)
      }
    })

    containerDsl += this.writeLine(`}`, level)

    return containerDsl
  }

  private writeSoftwareSystem(softwareSystem: SoftwareSystem, level: number): string {
    let softwareSystemDsl = ""

    softwareSystemDsl += this.writeElement("softwareSystem", softwareSystem, level, false)

    softwareSystem.getChildElements().forEach((element) => {
      if (element instanceof Container) {
        softwareSystemDsl += this.writeContainer(element, level + 1)
      }
    })

    softwareSystemDsl += this.writeLine(`}`, level)

    return softwareSystemDsl
  }

  private writeRelationships(elements: Element[], level: number): string {
    let relationshipsDsl = ""

    elements.forEach(element => {
      element.getRelationshipsInHierarchy().forEach(relationship => {
        relationshipsDsl += this.writeLine(`${relationship.source.canonicalName} -> ${relationship.destination.canonicalName} "${relationship.description?? "uses"}" {`, level)
        if (relationship.technology) {
          relationshipsDsl += this.writeLine(`technology "${relationship.technology}"`, level + 1)
        }
        relationshipsDsl += this.writeLine(`tags ${relationship.tags.map(tag => `"${tag}"`).join(" ")}`, level + 1)
        relationshipsDsl += this.writeLine(`}`, level)
      })
    })

    return relationshipsDsl
  }

  private writeModel(model: Model, level: number): string {
    let modelDsl = ""

    modelDsl += this.writeLine(`model {`, level)
    modelDsl += this.writeLine('// Elements', level + 1)

    model.getPeople().forEach(person => {
      modelDsl += this.writeElement("person", person, level + 1)
    })

    model.getSoftwareSystems().forEach(softwareSystem => {
      modelDsl += this.writeSoftwareSystem(softwareSystem, level + 1)
    })

    modelDsl += this.writeLine('// Relationships', level + 1)
    modelDsl += this.writeRelationships(model.getPeople().concat(model.getSoftwareSystems()), level + 1)
    modelDsl += this.writeLine(`}`, level)

    return modelDsl
  }

  private writeView(view: View<Element>, viewType: string, level: number): string {
    let viewDsl = this.writeLine(`${viewType}${view.subject ? ' "' + view.subject.canonicalName + '"' : ""} "${view.key}" "${view.description}" {`, level)
    if (view.title) {
      viewDsl += this.writeLine(`title "${view.title}"`, level + 1)
    }
    view.scopes.forEach(scope => {
      viewDsl += this.writeLine(`${scope}`, level + 1)
    })
    viewDsl += this.writeLine(`}`, level)
    return viewDsl
  }

  private writeViews(views: Views, level: number): string {
    let viewDsl = ""

    viewDsl += this.writeLine(`views {`, level)

    viewDsl += this.writeLine('// System Landscape Views', level + 1)
    views.systemLandscapeViews.forEach(view => {
      viewDsl += this.writeView(view, "systemLandscape", level + 1)
    })

    viewDsl += this.writeLine('// System Context Views', level + 1)
    views.systemContextViews.forEach(view => {
      viewDsl += this.writeView(view, "systemContext", level + 1)
    })

    viewDsl += this.writeLine('// Container Views', level + 1)
    views.containerViews.forEach(view => {
      viewDsl += this.writeView(view, "container", level + 1)
    })

    viewDsl += this.writeLine('// Component Views', level + 1)
    views.componentViews.forEach(view => {
      viewDsl += this.writeView(view, "component", level + 1)
    })

    viewDsl += this.writeLine(`theme default`, level + 1)
    viewDsl += this.writeLine(`}`, level)

    return viewDsl
  }

  public write(): string {
    let dsl = ""

    this.model.validate()

    dsl += this.writeLine(`workspace "${this.model.name}" {`, 0)
    dsl += this.writeModel(this.model, 1)
    dsl += this.writeViews(this.views, 1)
    dsl += this.writeLine(`}`, 0)

    return dsl
  }

  private writeLine(line: string, level: number): string {
    const indent = " ".repeat(level * INDENT_SIZE)

    return `${indent}${line}\n`
  }
}
