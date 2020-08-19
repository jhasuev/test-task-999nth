import './styles/main.less';
import IMask from 'imask';

/**
** валидация форм
**/

for(let textarea of document.getElementsByTagName('textarea')){
  textarea.addEventListener("input", () => {
    // хороший пример с замыканием :)
    textarea.style.height = "1px";
    textarea.style.height = (21+(textarea.scrollHeight))+"px";
  })
}

/**
** маска для полей
**/

for(let element of document.querySelectorAll('input[data-mask]')){
  let mask = IMask(element, {
    mask: element.getAttribute('data-mask'),
  })

  mask.on("accept", () => {
    if (mask.masked.isComplete) {
      mask.el.input.classList.remove('error')
    } else {
      mask.el.input.classList.add('error')
    }
  });
}

/**
********** валидация форм
**/


/**
** проверка полей на валидность
**/

const fieldValidate = (field, evenEmpty = true) => {
  let regs = {
    "email" : "^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$",
    "alias" : "^[a-zA-Z0-9-_]+$",
    "not_empty" : "\.+",
  }
  let rule = field.getAttribute('data-validate')
      rule = regs[rule] || rule

  let isValid = field.value.match(new RegExp(rule, 'gi'))

  if(!field.value.trim() && evenEmpty) {
    isValid = false
  }

  if (isValid) {
    field.classList.remove('error')
  } else {
    field.classList.add('error')
  }

  return isValid
}

/**
** проверка формы на валидность
**/
const checkFormValidate = (form) => {
  let isValid = true
  for(let field of document.querySelectorAll('input[data-validate], textarea[data-validate]')){
    if (field.getAttribute('data-mask')) {
      if (!field.value.trim()) {
        isValid = false;

        field.focus()
        field.value = '.'
        setTimeout(() => {
          field.value = ''
        }, 1)
        field.blur()
      } else if (field.classList.contains('error')) {
        isValid = false;
      }
      continue;
    }
    if (!fieldValidate(field, true)) {
      isValid = false;
    }
  }

  return isValid
}

/**
** события для полей валидации
**/
for(let field of document.querySelectorAll('input[data-validate], textarea[data-validate]')){
  if (field.getAttribute('data-mask')) continue;

  field.addEventListener("input", () => {
    fieldValidate(field)
  })
  field.addEventListener("blur", () => {
    fieldValidate(field)
  })
}

/**
** обработчик форм
**/
for(let form of document.forms){
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    if(checkFormValidate(form)) {
      console.log('success')
      alertToggle('hide')
      setTimeout(() => {
        alert('Сейчас будем просто перезагружать страницу, чтобы имитировать отправку формы...')
        location.reload()
        // удаляем данные из хранилища
        localStorage.removeItem("formData")
      }, 2000)
    } else {
      console.error('Form data are not filled currectly')
    }
  })
}



/**
** сохранение данных в localStorage
**/
const saveFormData = () => {
  let data = JSON.parse(localStorage.formData || "{}")
  for(let field of document.querySelectorAll('input, textarea')){
    switch(field.type){
      case 'checkbox':
      case 'radio':
        data[field.name] = field.checked
        break;
      default:
        data[field.name] = field.value
    }
  }

  localStorage.setItem("formData", JSON.stringify(data))
}

for(let field of document.querySelectorAll('input, textarea')){
  // console.log(field)
  field.addEventListener("input", saveFormData)
  field.addEventListener("change", saveFormData)
}

/**
** сохранение данных в localStorage
**/
const loadFormData = () => {
  let data = JSON.parse(localStorage.formData || "{}")
  let hasLoaded = false
  for(let field of document.querySelectorAll('input, textarea')){
    if (data[field.name]) {
      field.focus()
      
      switch(field.type){
        case 'checkbox':
        case 'radio':
          field.checked = data[field.name]
          break;
        default:
          field.value = data[field.name]
      }

      field.blur()
      hasLoaded = true
    }
  }
  
  if(hasLoaded) {
    alertToggle('show')
  }
}
loadFormData()

/**
** показ / скрытие алерта
**/
function alertToggle(type){
  let alert_message = document.querySelector(".js-alert-message")
  if (alert_message) {
    if (type == 'show') {
      alert_message.classList.remove('hide')
      alert_message.classList.add('show')
    } else {
      alert_message.classList.remove('show')
      alert_message.classList.add('hide')
    }
  }
}