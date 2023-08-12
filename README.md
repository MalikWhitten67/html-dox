## [Html-Dox](https://malikwhitten67.github.io/html-dox/) |  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/MalikWhitten67/html-dox/blob/main/LICENSE) | [Docs](https://github.com/MalikWhitten67/html-dox/wiki)
 <img src="https://th.bing.com/th/id/R.4c5dfa7ec90d6208a2a2e33adbd7c633?rik=cYlZy1p%2f4TEJGQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f08%2fChrome-Logo.png&ehk=qTc576MkpOTyH91AwsOr6MD868AywziPFN3Z2RxOFWQ%3d&risl=&pid=ImgRaw&r=0" width="20"> lts:114   ✅ | <img src="https://cdn.freebiesupply.com/logos/large/2x/firefox-logo-png-transparent.png" width="20"> lts:113  ✅ | <img src="https://th.bing.com/th/id/R.15317f39b369ebfe56a357aaea4860ab?rik=i1CnFnr0QPpDYg&pid=ImgRaw&r=0" width="20"> lts:113 ✅   

 
### Fast pwa optimized sequential dom lib

* Sequential - Dox adopts a unique approach called sequential processing. It treats all files as strings and efficiently splits the values, allowing for smooth manipulation of data. This method significantly contributes to faster rendering and improved performance, making your single-page applications (SPAs) highly responsive.
* Component-based - Similar to popular frameworks like React, Dox follows a component-based architecture. This modularity enables you to build your application in smaller, reusable components. This approach offers several benefits, particularly when collaborating with other developers. Additionally, you have the flexibility to write inline JavaScript within components, facilitating a dynamic and interactive user experience.
* Learn once - Dox focuses on simplicity and ease of use. It introduces new features only when necessary and adheres to established syntax constraints. This means you won't have to worry about constantly relearning the framework or dealing with major changes. Dox keeps it fast and straightforward, as it primarily utilizes raw HTML with enhanced functionality.



 
 
## How it Works

| Step                                      | Description                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| Components/Pages/config                   | Check if there are any components and pages in use. Convert them into functions and set the configuration (if supplied) to `window.config` for later use. |
| Sequential Selection                      | Select components/pages in a sequential order.                                  |
| Value Splitting/Value Replacing            | Replace variables with current variable state and set listeners for state changes. |
| Execution of Scripts                      | Execute any specified `<script>` tags.                                         |
| Combining Imported Components to Main Page functions| Combine the imported components with the main pages.                           |
| Bind templates to window.templates               | Generate a complete webpage with the manipulated components/pages. binded into the template object           |
| End                                       | End of the process.                                                            |
| Router                                   | Determine if there's a router involved in the framework.                        |

 

## Installation

Dox has been developed to be easy to use/install all u have to do is add a `<script>` tag!! [Guide To Installing](https://github.com/MalikWhitten67/html-dox/wiki/Getting-started)


# Examples

We have a few [Examples](https://github.com/MalikWhitten67/html-dox/tree/main/examples) - that show you how each aspect of dox is used.
```html
 <import src="/dox3.0/components/card.html"></import>
<script>
    let count = getState('count') || 0;
    let array = fetch('https://jsonplaceholder.typicode.com/todos/1')
        .then(response => response.json())
        .then(json => json);
  

    async function increment() {
        setState('count', ++count);
        setState('array', await  array);
    }
</script>
<script types>
 
    interface count {
            type: Number,
    }
    interface array {
            type: Object,
    }
</script>
<style>
    div {
        background-color: #eee;
        padding: 20px;
        border-radius: 5px;
        margin: 20px;
    }
</style>
<div>
     <card></card>
     <card></card>
     <card></card>
     ${
        getState('count') > 5 ? `<card></card>` : 'Not Greater'
     }
</div>
 ```
any other code
```

</container>

<!--card.html--->

 <card>
    <script execute>
        console.log('Card Loaded');
        console.log('you can execute js in your app')
    </script>
    <h1>Card</h1>
    <p>Count: ${getState('count') || 0}</p>
    <button onclick="increment()">Increment</button>
    ${
        getState('count') > 5 ? '<card></card>' : 'Not Greater'
    }
    <p>Array: ${getState('array') ? getState('array').title : `Woppy` } </p>
</card>
```
This example shows the use of components in dox3
