
## App Core and Model plan

The `AppCore` is an instance that is passed between each
`Activity` page and is the binding to the single app context
in an application.  Technically, one could (somehow) manage
multiple contexts, but why?  so the basic premise is this is
a shared common entity for all activities.

The model contains all the state values for the entire application.
The model is broken down into sections, where each section has
a collection of named properties.  Each of these properties can
hold a variety of values.  

The architecture is MVVM.  Changes to the model are reflected 
in components that bind to these values.

To accommodate both the Desktop and Nativescript contexts, this
binding occurs in two steps.

The first binding is component layer itself, and represents a
subset of the full model which has been curated to suit the needs
of the implemented View scope.

###### Bind Statement
This is done by providing a bind statement.

A bind statement is in the form `<path> [ as <name>]`

where `<path>` is a declaration in the form of `<section>.<property>`,
naming a location in the model.  For example `"Foo.bar"` represents
the value stored in the property `bar` in the section `Foo`

####### local bound group
A bind statement given as just the section.property path will bind
changes in the model at that value to a property in local `bound` scope
with the same property name.

For example, a bind to `Foo.bar` can be referenced locally as `bar` 
i.e. `{{ bar }}` in a NativeScript view XML context or as
`bound.bar` in the Riot implementation)

The scope of the local binding is inherited by its children,
which may add to or alter it within their own frame.
A view must declare a binding to a model path in order to access
those values of the model.

###### aliasing
A bind statement that includes the optional ` as <name>` directive
specifies the local name that this value should be referred to as.
This is necessary to avoid possible local name collision.
For example a bind to `Foo.bar as baz` will make the Model `Foo.bar` 
value accessible locally under the name `baz`.

###### Multiple bindings
A binding directive contains one or more bind statements,
separated by commas.

for example:

````
bind="SomeSection.foo, AnotherSection.bar, YetAnotherSection.foo as baz" 
````
will create the local bound group {foo, bar, baz} representing values from
different sections of the model.

###### onChange
Values are commuted upward from the model to the component when first bound and 
then on any subsequent update to the model value (typically performed with
the function `model.setAtPath`).

Value commutation is a two step process.  The first step posts values via the
`onChange` function of the component binding.  The second step then uses
the component technology to update the value in the locally bound context.

Note it is possible for a non-component to subscribe to the `onChange` event
of a model property also, so event handlers can be set up at business logic levels
directly.

###### UpdateAlways
Normally, values are only updated to the component when there has
been a change, but if a ! precedes the path statement, as in
`!Foo.bar`, then any write will force an update, even if the value stays
the same.

###### Downward updates
Values are commuted downward by setting the model value directly
with the `model.setAtPath` function.

_We could implement a setter on the local bound scope so that this 
effectively does this automatically on any write to the local value,
but I don't think that's necessary._



 