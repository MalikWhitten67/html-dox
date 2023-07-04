# html-dox

html-dox is a sequential DOM library aimed at making HTML more manageable and faster!

| Browser       |  Supported    | 
| ------------- |:-------------:| 
| <img src="https://th.bing.com/th/id/R.4c5dfa7ec90d6208a2a2e33adbd7c633?rik=cYlZy1p%2f4TEJGQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f08%2fChrome-Logo.png&ehk=qTc576MkpOTyH91AwsOr6MD868AywziPFN3Z2RxOFWQ%3d&risl=&pid=ImgRaw&r=0" width="20"> 114     | ✅|   
|<img src="https://cdn.freebiesupply.com/logos/large/2x/firefox-logo-png-transparent.png" width="20"> 113   | ✅     |   
| <img src="https://th.bing.com/th/id/R.15317f39b369ebfe56a357aaea4860ab?rik=i1CnFnr0QPpDYg&pid=ImgRaw&r=0" width="20"> 113 | ✅      |    
## Why?

- I'm tired of regular HTML lacking decent functionality, so I built a library to extend HTML's capabilities similar to React and other libraries.
- It enforces strict scopes, ensuring that no element can block or await the execution of other elements. Elements are added to the front or back of the chain without interfering with each other.
- It discourages poor practices such as inline JS or styling, promoting better coding practices by limiting their usage.

## Why Sequential?

The DOM is essentially a tree structure. However, the DOM doesn't understand our custom elements. For example, while `<nav>` is a valid HTML element, `<navigator>` doesn't exist. To make such custom elements work, we utilize a special element called `<render>`. This element allows us to change the sequencing structure, and it is the only element that html-dox focuses on, as it determines the order of execution in the rendering sequence.

Benefits of sequential approach:
- Faster execution: Transpiling can be slow, but the sequential approach offers faster rendering by updating values only when necessary and minimizing the blocking of the main thread.

