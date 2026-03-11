import { Element, Relationship } from './core'
import { Component } from './component'
import { Container, ContainerGroup } from './container'
import { Model, ModelGroup } from './model'
import { SoftwareSystem, SoftwareSystemGroup } from './softwareSystem'
import { View, Views } from './views'
import { ElementArchetype, RelationshipArchetype } from './archetype'

const INDENT_SIZE = 2

export class StructurizrDSLWriter {
    public constructor(
        private readonly model: Model,
        private readonly views: Views
    ) {}

    private collectArchetypes(): { elementArchetypes: ElementArchetype[]; relationshipArchetypes: RelationshipArchetype[] } {
        const elementSet = new Set<ElementArchetype>()
        const relationshipSet = new Set<RelationshipArchetype>()

        const collectFromElement = (element: Element) => {
            if (element.archetype) {
                let arch: ElementArchetype | undefined = element.archetype
                while (arch) {
                    elementSet.add(arch)
                    arch = arch.parent
                }
            }
            element.relationships.forEach((rel) => {
                if (rel.archetype) {
                    let arch: RelationshipArchetype | undefined = rel.archetype
                    while (arch) {
                        relationshipSet.add(arch)
                        arch = arch.parent
                    }
                }
            })
            element.getChildElements().forEach(collectFromElement)
        }

        const allElements: Element[] = [...this.model.getPeople(), ...this.model.getSoftwareSystems()]
        allElements.forEach(collectFromElement)

        // Topological sort: parents before children
        const sortArchetypes = <T extends { parent?: T }>(set: Set<T>): T[] => {
            const sorted: T[] = []
            const visited = new Set<T>()
            const visit = (arch: T) => {
                if (visited.has(arch)) return
                if (arch.parent && set.has(arch.parent)) visit(arch.parent)
                visited.add(arch)
                sorted.push(arch)
            }
            set.forEach(visit)
            return sorted
        }

        return {
            elementArchetypes: sortArchetypes(elementSet),
            relationshipArchetypes: sortArchetypes(relationshipSet),
        }
    }

    private writeArchetypes(level: number): string {
        const { elementArchetypes, relationshipArchetypes } = this.collectArchetypes()
        if (elementArchetypes.length === 0 && relationshipArchetypes.length === 0) return ''

        let dsl = this.writeLine(`archetypes {`, level)

        for (const arch of elementArchetypes) {
            const baseType = arch.parent ? arch.parent.name : arch.elementKind
            let inner = ''
            if (arch.ownDescription) {
                inner += this.writeLine(`description "${arch.ownDescription}"`, level + 2)
            }
            if (arch.ownTechnology) {
                inner += this.writeLine(`technology "${arch.ownTechnology}"`, level + 2)
            }
            if (arch.ownTags.length > 0) {
                inner += this.writeLine(`tags ${arch.ownTags.map((t) => `"${t}"`).join(' ')}`, level + 2)
            }
            if (inner) {
                dsl += this.writeLine(`${arch.name} = ${baseType} {`, level + 1)
                dsl += inner
                dsl += this.writeLine(`}`, level + 1)
            } else {
                dsl += this.writeLine(`${arch.name} = ${baseType} {}`, level + 1)
            }
        }

        for (const arch of relationshipArchetypes) {
            const arrow = arch.parent ? `--${arch.parent.name}->` : `->`
            let inner = ''
            if (arch.ownDescription) {
                inner += this.writeLine(`description "${arch.ownDescription}"`, level + 2)
            }
            if (arch.ownTechnology) {
                inner += this.writeLine(`technology "${arch.ownTechnology}"`, level + 2)
            }
            if (arch.ownTags.length > 0) {
                inner += this.writeLine(`tags ${arch.ownTags.map((t) => `"${t}"`).join(' ')}`, level + 2)
            }
            if (inner) {
                dsl += this.writeLine(`${arch.name} = ${arrow} {`, level + 1)
                dsl += inner
                dsl += this.writeLine(`}`, level + 1)
            } else {
                dsl += this.writeLine(`${arch.name} = ${arrow} {}`, level + 1)
            }
        }

        dsl += this.writeLine(`}`, level)
        return dsl
    }

    private writeElement(elementType: string, element: Element, level: number, closeElement = true): string {
        let elementDsl = ''

        const type = element.archetype ? element.archetype.name : elementType
        elementDsl += this.writeLine(`${element.canonicalName} = ${type} "${element.name}" {`, level)
        if (element.archetype) {
            const ovr = element.overrideDefinition
            if (ovr?.description) {
                elementDsl += this.writeLine(`description "${ovr.description}"`, level + 1)
            }
            if (ovr?.tags && ovr.tags.length > 0) {
                elementDsl += this.writeLine(`tags ${ovr.tags.map((tag) => `"${tag}"`).join(' ')}`, level + 1)
            }
            if (ovr && 'technology' in ovr && ovr.technology) {
                elementDsl += this.writeLine(`technology "${ovr.technology}"`, level + 1)
            }
        } else {
            if (element.description) {
                elementDsl += this.writeLine(`description "${element.description}"`, level + 1)
            }
            elementDsl += this.writeLine(`tags ${element.tags.map((tag) => `"${tag}"`).join(' ')}`, level + 1)
        }
        if (closeElement) {
            elementDsl += this.writeLine(`}`, level)
        }
        return elementDsl
    }

    private writeComponent(component: Component, level: number): string {
        let componentDsl = ''

        componentDsl += this.writeElement('component', component, level, false)
        if (!component.archetype && component.technology) {
            componentDsl += this.writeLine(`technology "${component.technology}"`, level + 1)
        }
        componentDsl += this.writeLine(`}`, level)

        return componentDsl
    }

    private writeContainerGroup(group: ContainerGroup, level: number): string {
        let containerGroupDsl = ''
        const hasDirect = group.getComponents().length > 0
        if (hasDirect) {
            containerGroupDsl += this.writeLine(`${group.canonicalName} = group "${group.dslName}" {`, level)
            group.getComponents().forEach((component) => {
                containerGroupDsl += this.writeComponent(component, level + 1)
            })
            containerGroupDsl += this.writeLine(`}`, level)
        }
        group.getGroups().forEach((nested) => {
            containerGroupDsl += this.writeContainerGroup(nested, level)
        })
        return containerGroupDsl
    }

    private writeContainer(container: Container, level: number): string {
        let containerDsl = ''

        containerDsl += this.writeElement('container', container, level, false)
        if (!container.archetype && container.technology) {
            containerDsl += this.writeLine(`technology "${container.technology}"`, level + 1)
        }

        container.getComponentsNotInGroups().forEach((component) => {
            containerDsl += this.writeComponent(component, level + 1)
        })

        container.getGroups().forEach((group) => {
            containerDsl += this.writeContainerGroup(group, level + 1)
        })

        containerDsl += this.writeLine(`}`, level)

        return containerDsl
    }

    private writeSoftwareSystemGroup(group: SoftwareSystemGroup, level: number): string {
        let softwareSystemGroupDsl = ''
        const hasDirect = group.getContainers().length > 0
        if (hasDirect) {
            softwareSystemGroupDsl += this.writeLine(`${group.canonicalName} = group "${group.dslName}" {`, level)
            group.getContainers().forEach((container) => {
                softwareSystemGroupDsl += this.writeContainer(container, level + 1)
            })
            softwareSystemGroupDsl += this.writeLine(`}`, level)
        }
        group.getGroups().forEach((nested) => {
            softwareSystemGroupDsl += this.writeSoftwareSystemGroup(nested, level)
        })
        return softwareSystemGroupDsl
    }

    private writeSoftwareSystem(softwareSystem: SoftwareSystem, level: number): string {
        let softwareSystemDsl = ''

        softwareSystemDsl += this.writeElement('softwareSystem', softwareSystem, level, false)

        softwareSystem.getContainersNotInGroups().forEach((container) => {
            softwareSystemDsl += this.writeContainer(container, level + 1)
        })

        softwareSystem.getGroups().forEach((group) => {
            softwareSystemDsl += this.writeSoftwareSystemGroup(group, level + 1)
        })

        softwareSystemDsl += this.writeLine(`}`, level)

        return softwareSystemDsl
    }

    private writeRelationship(relationship: Relationship, level: number): string {
        let dsl = ''
        if (relationship.archetype) {
            const arrow = `--${relationship.archetype.name}->`
            const ovr = relationship.overrideDefinition
            const desc = ovr?.description ?? relationship.description ?? 'uses'
            dsl += this.writeLine(
                `${relationship.source.canonicalName} ${arrow} ${relationship.destination.canonicalName} "${desc}" {`,
                level
            )
            if (ovr?.technology) {
                dsl += this.writeLine(`technology "${ovr.technology}"`, level + 1)
            }
            if (ovr?.tags && ovr.tags.length > 0) {
                dsl += this.writeLine(`tags ${ovr.tags.map((tag) => `"${tag}"`).join(' ')}`, level + 1)
            }
            dsl += this.writeLine(`}`, level)
        } else {
            const tech = relationship.technology ? ` "${relationship.technology}"` : ''
            dsl += this.writeLine(
                `${relationship.source.canonicalName} -> ${relationship.destination.canonicalName} "${relationship.description ?? 'uses'}"${tech} {`,
                level
            )
            dsl += this.writeLine(`tags ${relationship.tags.map((tag) => `"${tag}"`).join(' ')}`, level + 1)
            dsl += this.writeLine(`}`, level)
        }
        return dsl
    }

    private writeRelationships(elements: Element[], level: number): string {
        let relationshipsDsl = ''

        elements.forEach((element) => {
            element.getRelationshipsInHierarchy().forEach((relationship) => {
                relationshipsDsl += this.writeRelationship(relationship, level)
            })
        })

        return relationshipsDsl
    }

    private hasNestedModelGroups(groups: ReadonlyArray<ModelGroup>): boolean {
        return groups.some((g) => g.getGroups().length > 0 || this.hasNestedModelGroups(g.getGroups()))
    }

    private hasNestedSoftwareSystemGroups(groups: ReadonlyArray<SoftwareSystemGroup>): boolean {
        return groups.some((g) => g.getGroups().length > 0 || this.hasNestedSoftwareSystemGroups(g.getGroups()))
    }

    private hasNestedContainerGroups(groups: ReadonlyArray<ContainerGroup>): boolean {
        return groups.some((g) => g.getGroups().length > 0 || this.hasNestedContainerGroups(g.getGroups()))
    }

    private hasNestedGroups(): boolean {
        if (this.hasNestedModelGroups(this.model.getGroups())) return true
        for (const ss of this.model.getSoftwareSystems()) {
            if (this.hasNestedSoftwareSystemGroups(ss.getGroups())) return true
            for (const c of ss.getGroups().flatMap((g) => g.getAllContainers())) {
                if (this.hasNestedContainerGroups(c.getGroups())) return true
            }
        }
        return false
    }

    private writeModelGroup(group: ModelGroup, level: number): string {
        let modelGroupDsl = ''
        const hasDirect = group.getPeople().length > 0 || group.getSoftwareSystems().length > 0
        if (hasDirect) {
            modelGroupDsl += this.writeLine(`${group.canonicalName} = group "${group.dslName}" {`, level)
            group.getPeople().forEach((person) => {
                modelGroupDsl += this.writeElement('person', person, level + 1)
            })
            group.getSoftwareSystems().forEach((softwareSystem) => {
                modelGroupDsl += this.writeSoftwareSystem(softwareSystem, level + 1)
            })
            modelGroupDsl += this.writeLine(`}`, level)
        }
        group.getGroups().forEach((nested) => {
            modelGroupDsl += this.writeModelGroup(nested, level)
        })
        return modelGroupDsl
    }

    private writeModel(model: Model, level: number): string {
        let modelDsl = ''

        modelDsl += this.writeLine(`model {`, level)
        if (this.hasNestedGroups()) {
            modelDsl += this.writeLine(`properties {`, level + 1)
            modelDsl += this.writeLine(`"structurizr.groupSeparator" "/"`, level + 2)
            modelDsl += this.writeLine(`}`, level + 1)
        }
        modelDsl += this.writeArchetypes(level + 1)
        modelDsl += this.writeLine('// Elements', level + 1)

        model.getPeopleNotInGroups().forEach((person) => {
            modelDsl += this.writeElement('person', person, level + 1)
        })

        model.getSoftwareSystemsNotInGroups().forEach((softwareSystem) => {
            modelDsl += this.writeSoftwareSystem(softwareSystem, level + 1)
        })

        model.getGroups().forEach((group) => {
            modelDsl += this.writeModelGroup(group, level + 1)
        })

        modelDsl += this.writeLine('// Relationships', level + 1)
        modelDsl += this.writeRelationships(model.getPeople().concat(model.getSoftwareSystems()), level + 1)
        modelDsl += this.writeLine(`}`, level)

        return modelDsl
    }

    private writeView(view: View<Element>, viewType: string, level: number): string {
        let viewDsl = this.writeLine(`${viewType}${view.subject ? ' "' + view.subject.canonicalName + '"' : ''} "${view.key}" {`, level)
        viewDsl += this.writeLine(`description "${view.description}"`, level + 1)
        if (view.title) {
            viewDsl += this.writeLine(`title "${view.title}"`, level + 1)
        }
        if (view.isDefault) {
            viewDsl += this.writeLine('default', level + 1)
        }
        view.scopes.forEach((scope) => {
            viewDsl += this.writeLine(`${scope}`, level + 1)
        })
        if (view.autoLayoutConfig) {
            const { direction, rankSeparation, nodeSeparation } = view.autoLayoutConfig
            let line = 'autoLayout'
            if (direction) line += ` ${direction}`
            if (rankSeparation !== undefined) line += ` ${rankSeparation}`
            if (nodeSeparation !== undefined) line += ` ${nodeSeparation}`
            viewDsl += this.writeLine(line, level + 1)
        }
        if (view.properties.size > 0) {
            viewDsl += this.writeLine('properties {', level + 1)
            for (const [name, value] of view.properties) {
                viewDsl += this.writeLine(`"${name}" "${value}"`, level + 2)
            }
            viewDsl += this.writeLine('}', level + 1)
        }
        viewDsl += this.writeLine(`}`, level)
        return viewDsl
    }

    private writeStyles(views: Views, level: number): string {
        const { elementStyles, relationshipStyles } = views
        if (elementStyles.length === 0 && relationshipStyles.length === 0) return ''
        let dsl = this.writeLine('styles {', level)
        for (const { tag, definition: d } of elementStyles) {
            dsl += this.writeLine(`element "${tag}" {`, level + 1)
            if (d.shape) dsl += this.writeLine(`shape ${d.shape}`, level + 2)
            if (d.icon) dsl += this.writeLine(`icon "${d.icon}"`, level + 2)
            if (d.width) dsl += this.writeLine(`width ${d.width}`, level + 2)
            if (d.height) dsl += this.writeLine(`height ${d.height}`, level + 2)
            if (d.background) dsl += this.writeLine(`background "${d.background}"`, level + 2)
            if (d.color) dsl += this.writeLine(`color "${d.color}"`, level + 2)
            if (d.stroke) dsl += this.writeLine(`stroke "${d.stroke}"`, level + 2)
            if (d.strokeWidth) dsl += this.writeLine(`strokeWidth ${d.strokeWidth}`, level + 2)
            if (d.fontSize) dsl += this.writeLine(`fontSize ${d.fontSize}`, level + 2)
            if (d.border) dsl += this.writeLine(`border ${d.border}`, level + 2)
            if (d.opacity !== undefined) dsl += this.writeLine(`opacity ${d.opacity}`, level + 2)
            if (d.metadata !== undefined) dsl += this.writeLine(`metadata ${d.metadata}`, level + 2)
            if (d.description !== undefined) dsl += this.writeLine(`description ${d.description}`, level + 2)
            dsl += this.writeLine('}', level + 1)
        }
        for (const { tag, definition: d } of relationshipStyles) {
            dsl += this.writeLine(`relationship "${tag}" {`, level + 1)
            if (d.thickness) dsl += this.writeLine(`thickness ${d.thickness}`, level + 2)
            if (d.color) dsl += this.writeLine(`color "${d.color}"`, level + 2)
            if (d.style) dsl += this.writeLine(`style ${d.style}`, level + 2)
            if (d.routing) dsl += this.writeLine(`routing ${d.routing}`, level + 2)
            if (d.fontSize) dsl += this.writeLine(`fontSize ${d.fontSize}`, level + 2)
            if (d.width) dsl += this.writeLine(`width ${d.width}`, level + 2)
            if (d.position !== undefined) dsl += this.writeLine(`position ${d.position}`, level + 2)
            if (d.opacity !== undefined) dsl += this.writeLine(`opacity ${d.opacity}`, level + 2)
            dsl += this.writeLine('}', level + 1)
        }
        dsl += this.writeLine('}', level)
        return dsl
    }

    private writeViews(views: Views, level: number): string {
        let viewDsl = ''

        viewDsl += this.writeLine(`views {`, level)

        viewDsl += this.writeLine('// System Landscape Views', level + 1)
        views.systemLandscapeViews.forEach((view) => {
            viewDsl += this.writeView(view, 'systemLandscape', level + 1)
        })

        viewDsl += this.writeLine('// System Context Views', level + 1)
        views.systemContextViews.forEach((view) => {
            viewDsl += this.writeView(view, 'systemContext', level + 1)
        })

        viewDsl += this.writeLine('// Container Views', level + 1)
        views.containerViews.forEach((view) => {
            viewDsl += this.writeView(view, 'container', level + 1)
        })

        viewDsl += this.writeLine('// Component Views', level + 1)
        views.componentViews.forEach((view) => {
            viewDsl += this.writeView(view, 'component', level + 1)
        })

        viewDsl += this.writeStyles(views, level + 1)

        if (views.themes.length === 1) {
            viewDsl += this.writeLine(`theme ${views.themes[0]}`, level + 1)
        } else if (views.themes.length > 1) {
            viewDsl += this.writeLine(`themes ${views.themes.join(' ')}`, level + 1)
        }

        if (views.properties.size > 0) {
            viewDsl += this.writeLine('properties {', level + 1)
            for (const [name, value] of views.properties) {
                viewDsl += this.writeLine(`"${name}" "${value}"`, level + 2)
            }
            viewDsl += this.writeLine('}', level + 1)
        }

        viewDsl += this.writeLine(`}`, level)

        return viewDsl
    }

    public write(): string {
        let dsl = ''

        this.model.validate()

        dsl += this.writeLine(`workspace "${this.model.name}" {`, 0)
        dsl += this.writeModel(this.model, 1)
        dsl += this.writeViews(this.views, 1)
        dsl += this.writeLine(`}`, 0)

        return dsl
    }

    private writeLine(line: string, level: number): string {
        const indent = ' '.repeat(level * INDENT_SIZE)

        return `${indent}${line}\n`
    }
}
