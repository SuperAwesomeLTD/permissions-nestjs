# SuperAwesome Permissions for NestJS Guard & Decorators

## Introduction

SuperAwesome Permissions for NestJS is where the project shines & shows its orthogonal & Aspect Oriented architecture. It provides **full support** and **seamless integration** for: 

* [SuperAwesome Permissions library](https://permissions.docs.superawesome.com), including [PermissionDefinitions](https://permissions.docs.superawesome.com/classes/PermissionDefinition.html), ownership hooks and method injection of the automatically created [Permit object](https://permissions.docs.superawesome.com/classes/Permit.html) to accompany every request's lifetime. 
   
* The [NestJS Guard architecture](https://docs.nestjs.com/guards), using the deceptively simple [createPermissionsGuard factory function](/miscellaneous/variables.html#createPermissionsGuard) to declaratively configure a specific controller's Guard, passed into nestjs's `@UseGuards`. 
 
  The Guard is **actively allowing or forbidding access to every method/endpoint** of your controller, before the method is even executed (if that makes sense). 
  
  The declarative and DRY nature is achieved by the use decorators & **introspecting and extracting all possible information** from your existing code & runtime, making the whole Authorization (i.e Permissions) architecture [aspect oriented](https://en.wikipedia.org/wiki/Aspect-oriented_programming) & almost completely [orthogonal](https://en.wikipedia.org/wiki/Orthogonality_(programming)) to your application.  

## How to use 

First, you need to understand the basics of [how SuperAwesome Permissions works](https://permissions.docs.superawesome.com/additional-documentation/introduction-&-glossary.html). 

Then please continue to: 

- [How to use & simple example](/additional-documentation/how-to-use-simple-example.html) for a quick overview and how to use in the most simple & declarative example. 

- Then move on to a [detailed example which is also the reference](/additional-documentation/reference-&-detailed-example.html).

## How to install & configure

To install simply:

  ```bash
  $ npm install @superawesome/permissions @superawesome/permissions-nestjs --save
  ```

Make sure `@superawesome/permissions` version is the right one (as in its `peerDependencies`). 
