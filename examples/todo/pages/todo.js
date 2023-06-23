let todolist = dox.querySelector('#list')

let inputval = JSON.parse(localStorage.getItem('inputval')) || []
if (inputval.length > 0) {
    inputval.map(function (inputval) {
        console.log(inputval)
        return;
    })
    inputval.forEach(function (inputval) {
        console.log(inputval)
        todolist.prepend(`<li class="list-none flex justify-between items-center p-2 border-b-2 border-gray-200 hover:bg-gray-100 transition duration-300 ease-in-out rounded-md 
     cursor-pointer">
     <p>${inputval}</p>
     <button id="delete" class="btn btn-sm btn-danger">Delete</button>
     </li>`)
    })

    let deletebtns = dox.querySelectorAll('#delete')
    deletebtns.forEach(function (deletebtn) {
        deletebtn.on('click', function (event) {
            deletebtn.parent.remove()

            inputval.pop()
            localStorage.setItem('inputval', JSON.stringify(inputval))
        })
    })
}
let val
dox.querySelector('todo').getDescendants().forEach(function (descendant) {
    let todolist = dox.querySelector('#list')
    if (descendant.id == 'submit') {
        effect(('todo'), function (value) {
            val = value
            inputval.push(val)
            localStorage.setItem('inputval', JSON.stringify(inputval))
        })


        descendant.on('click', function (event) {
            todolist.prepend(`<li class="list-none flex justify-between items-center p-2 border-b-2 border-gray-200 hover:bg-gray-100 transition duration-300 ease-in-out rounded-md 
            cursor-pointer">
            <p>${val}</p>
            <button id="delete" class="btn btn-sm btn-danger">Delete</button>
            </li>`)

            let deletebtns = descendant.querySelectorAll('#delete')
            deletebtns.forEach(function (deletebtn) {
                deletebtn.on('click', function (event) {
                    deletebtn.parent.remove()
                })
            })
        })
    }
});

