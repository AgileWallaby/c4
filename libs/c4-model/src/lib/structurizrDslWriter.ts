import { Element } from "./core"
import { Component } from "./component"
import { Container } from "./container"
import { Model } from "./model"
import { SoftwareSystem } from "./softwareSystem"


const INDENT_SIZE = 2

export class StructurizrDSLWriter {

  public constructor(private readonly model: Model) {
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
        relationshipsDsl += this.writeLine(`${relationship.source.canonicalName} -> ${relationship.destination.canonicalName} "${relationship.description}" {`, level)
        if (relationship.technology) {
          relationshipsDsl += this.writeLine(`technology "${relationship.technology}"`, level + 1)
        }
        relationshipsDsl += this.writeLine(`}`, level)
      })
    })

    return relationshipsDsl
  }

  public write(): string {
    let dsl = ""

    dsl += this.writeLine(`workspace "${this.model.name}" {`, 0)
    dsl += this.writeLine('model {', 1)
    dsl += this.writeLine('// Elements', 2)

    this.model.getPeople().forEach(person => {
      dsl += this.writeElement("person", person, 2)
    })

    this.model.getSoftwareSystems().forEach(softwareSystem => {
      dsl += this.writeSoftwareSystem(softwareSystem, 2)
    })

    dsl += this.writeLine('// Relationships', 2)

    dsl += this.writeRelationships(this.model.getPeople().concat(this.model.getSoftwareSystems()), 2)

    dsl += this.writeLine('}', 1)
    dsl += this.writeLine('views {', 1)
    dsl += this.writeLine('}', 1)
    dsl += this.writeLine('}', 0)

    return dsl
  }

  private writeLine(line: string, level: number): string {
    const indent = " ".repeat(level * INDENT_SIZE)

    return `${indent}${line}\n`
  }
}
