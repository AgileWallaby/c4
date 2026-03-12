export interface WorkspaceJson {
  name?: string;
  model: Model;
  views: Views;
  configuration?: Configuration;
}

export interface Model {
  people?: Person[];
  softwareSystems?: SoftwareSystem[];
  groups?: Group[];
  relationships?: Relationship[];
}

export interface Person {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  relationships?: Relationship[];
}

export interface SoftwareSystem {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  containers?: Container[];
  relationships?: Relationship[];
}

export interface Container {
  id: string;
  name: string;
  description?: string;
  technology?: string;
  tags?: string;
  relationships?: Relationship[];
}

export interface Group {
  id?: string;
  name: string;
  people?: Person[];
  softwareSystems?: SoftwareSystem[];
}

export interface Relationship {
  id: string;
  sourceId: string;
  destinationId: string;
  description?: string;
  technology?: string;
  tags?: string;
}

export interface Views {
  systemLandscapeViews?: StructurizrView[];
  systemContextViews?: StructurizrView[];
  containerViews?: StructurizrView[];
}

export interface StructurizrView {
  key: string;
  description?: string;
  softwareSystemId?: string;
  elements?: ViewElement[];
  relationships?: ViewRelationship[];
  autoLayout?: AutoLayout;
}

export interface ViewElement {
  id: string;
  x?: number;
  y?: number;
}

export interface ViewRelationship {
  id: string;
}

export interface AutoLayout {
  rankDirection?: 'TopBottom' | 'BottomTop' | 'LeftRight' | 'RightLeft';
  rankSeparation?: number;
  nodeSeparation?: number;
}

export interface Configuration {
  styles?: Styles;
}

export interface Styles {
  elements?: ElementStyle[];
  relationships?: RelationshipStyle[];
}

export interface ElementStyle {
  tag: string;
  background?: string;
  color?: string;
  shape?: string;
  border?: string;
}

export interface RelationshipStyle {
  tag: string;
  color?: string;
  dashed?: boolean;
  thickness?: number;
}

// Internal types for the parser's element lookup map
export type ElementType = 'Person' | 'SoftwareSystem' | 'Container' | 'Group';

export interface ResolvedElement {
  id: string;
  name: string;
  description?: string;
  technology?: string;
  tags?: string;
  type: ElementType;
  isExternal: boolean;
  parentSystemId?: string;
  groupId?: string;
}
