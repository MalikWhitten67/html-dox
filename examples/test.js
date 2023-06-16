let el = dox.querySelector('dox$mycomponent') // this is how we select dox components / chuld elements
 
el.getChildren().forEach((child) => {
  // we can get the children
    if(child.id == 'child'){
        console.log(child)
         child.onclick = () => {
            child.inject('Hello ')
                 // inject resets the value from the child  to the value you want
         }
       
    }
}  
)
 
