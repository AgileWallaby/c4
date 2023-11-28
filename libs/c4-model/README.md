# `@agilewallaby/c4-model`

This is an opinionated Typescript library for generating C4 models in code, and then exporting the
model to one or more supported formats for consumption by a rendering mechanism.

Currently supported output formats are:

* [Structurizr DSL](https://github.com/structurizr/dsl/blob/master/docs/language-reference.md): only the
static views are supported, e.g. system landscape, system context, container, and component diagrams.
Deployment and dynamic diagrams may be supported in the future.

Other formats that may be supported in the future:

* The [YAML format](https://backstage.io/docs/features/software-catalog/descriptor-format) specified by
[Spotify Backstage](https://backstage.io/) for documenting systems in the [Software Catalog](https://backstage.io/docs/features/software-catalog/).

## Usage

The core of this library is the `Model` class. From here you can 'define' instances of `SoftwareSystem`
and `Person`. They can also be defined through a `Group`;

```
import { Model } from '@agilewallaby/c4-model'

const model = new Model("myModel")
const system1 = model.defineSoftwareSystem("system1")
```
