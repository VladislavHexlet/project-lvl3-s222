import 'bootstrap/dist/css/bootstrap.min.css';

const jumbotron = document.createElement('div');
jumbotron.setAttribute('class', 'jumbotron');

const rssForm = document.createElement('form');

const textInput = document.createElement('input');
textInput.setAttribute('type', 'text');
const button = document.createElement('input');
button.setAttribute('type', 'submit');

[textInput, button].forEach(el => rssForm.append(el));
jumbotron.append(rssForm);
document.body.prepend(jumbotron);
