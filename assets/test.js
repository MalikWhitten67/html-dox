let el = dox.querySelector('mycomponent');

el.getDescendants().forEach(async (el) => {
 
        if(el.id === 'installbtn'){
            el.on('click', () => {
                window.location.href = 'https://github.com/MalikWhitten67/html-dox/releases/latest/'

            })
        }
     
     
});
 
 
 