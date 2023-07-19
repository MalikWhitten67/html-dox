## [Html-Dox](https://malikwhitten67.github.io/html-dox/) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/MalikWhitten67/html-dox/blob/main/LICENSE)

### Fast pwa optimized sequential dom lib

* Sequential - Dox adopts a unique approach called sequential processing. It treats all files as strings and efficiently splits the values, allowing for smooth manipulation of data. This method significantly contributes to faster rendering and improved performance, making your single-page applications (SPAs) highly responsive.
* Component-based - Similar to popular frameworks like React, Dox follows a component-based architecture. This modularity enables you to build your application in smaller, reusable components. This approach offers several benefits, particularly when collaborating with other developers. Additionally, you have the flexibility to write inline JavaScript within components, facilitating a dynamic and interactive user experience.
* Learn once - Dox focuses on simplicity and ease of use. It introduces new features only when necessary and adheres to established syntax constraints. This means you won't have to worry about constantly relearning the framework or dealing with major changes. Dox keeps it fast and straightforward, as it primarily utilizes raw HTML with enhanced functionality.

With Dox, you can build performant web applications efficiently and enjoy a seamless development experience.


| Browser       |  Supported    | 
| ------------- |:-------------:| 
| <img src="https://th.bing.com/th/id/R.4c5dfa7ec90d6208a2a2e33adbd7c633?rik=cYlZy1p%2f4TEJGQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f08%2fChrome-Logo.png&ehk=qTc576MkpOTyH91AwsOr6MD868AywziPFN3Z2RxOFWQ%3d&risl=&pid=ImgRaw&r=0" width="20"> 114     | ✅|   
|<img src="https://cdn.freebiesupply.com/logos/large/2x/firefox-logo-png-transparent.png" width="20"> 113   | ✅     |   
| <img src="https://th.bing.com/th/id/R.15317f39b369ebfe56a357aaea4860ab?rik=i1CnFnr0QPpDYg&pid=ImgRaw&r=0" width="20"> 113 | ✅      |    

[Docs](https://github.com/MalikWhitten67/html-dox/wiki)

## How it works
components/pages?  
sequential selection → 
value splitting/value replacing →
execution of after or before scripts* →  
combining imported components to main pages* → 
returns as a full webpage* → end → router?

## Why?



- I'm tired of regular HTML lacking decent functionality, so I built a library to extend HTML's capabilities similar to React and other libraries.
- It enforces strict scopes, ensuring that no element can block or await the execution of other elements. Elements are added to the front or back of the chain without interfering with each other.
- It decreases spaghetti code by allowing modularity
- It has type checking built in
- It has state management built in!

## Why Sequential?

The DOM is essentially a tree structure. However, the DOM doesn't understand our custom elements. For example, while `<nav>` is a valid HTML element, `<navigator>` doesn't exist. To make such custom elements work, we utilize a special element called `<render>`. This element allows us to change the sequencing structure, and it is the only element that html-dox focuses on, as it determines the order of execution in the rendering sequence.

Benefits of sequential approach:
- Faster execution: Transpiling can be slow, but the sequential approach offers faster rendering by updating values only when necessary and minimizing the blocking of the main thread.

