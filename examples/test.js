let el = dox.querySelector('dox$mycomponent');

el.getDescendants().forEach((el) => {
    el.onclick = () => {
        if(el.id === 'child') {
             el.$ = 'child';
             el.inject(el.$)
        }
    };
  
});
