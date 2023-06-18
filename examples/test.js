let el = dox.querySelector('mycomponent');
el.getDescendants().forEach((el) => {
     
    el.on('click', () => {
        if(el.id == 'getstartedbtn'){
           el.inject('e');
        }
    });
});
 
 
$export('test',  el);

$import('test') // way to import
