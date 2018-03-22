import isURL from 'validator/lib/isURL';
import axios from 'axios';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';
import './style.css';

let userInput = '';
const feedData = {};

const validateUserInput = (inputEl) => {
  if (isURL(userInput) || userInput.length === 0) {
    inputEl.classList.remove('is-invalid');
  } else {
    inputEl.classList.add('is-invalid');
  }
};

const parseXML = (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'application/xml');
  return xml;
};

const createModalButton = () => {
  const button = document.createElement('button');
  button.setAttribute('class', 'btn btn-info btn-sm ml-2');
  button.setAttribute('type', 'button');
  button.setAttribute('data-toggle', 'modal');
  button.setAttribute('data-target', '#exampleModal');
  button.textContent = 'Info';
  return button;
};

const processingNewsArticles = (titleOfRssChannel, articles) => {
  const table = document.body.querySelector('#news-articles');
  const tBody = document.createElement('tBody');
  const titleTr = document.createElement('tr');
  const titleTh = document.createElement('th');
  table.append(tBody);
  tBody.append(titleTr);
  titleTr.append(titleTh);
  titleTh.append(titleOfRssChannel);
  articles.forEach((article) => {
    const articleTr = document.createElement('tr');
    const articleTd = document.createElement('td');
    const articleA = document.createElement('a');
    const articleTitle = article.querySelector('title').textContent;
    const articleLink = article.querySelector('link').textContent;
    const articleDescription = article.querySelector('description').textContent;
    const button = createModalButton();
    $(button).on('click', () => {
      $('.modal-body').text(articleDescription);
    });
    articleTr.append(articleTd);
    articleTd.append(articleA);
    articleTd.append(button);
    articleA.append(articleTitle);
    articleA.setAttribute('href', articleLink);
    table.append(articleTr);
  });
};

const xmlProcessing = (xml) => {
  const mainTitle = xml.querySelector('title').textContent;
  if (!(mainTitle in feedData)) {
    let mainDescription = xml.querySelector('description').textContent;
    if (!(mainDescription)) {
      mainDescription = 'No Description';
    }
    const tr = document.createElement('tr');
    const tdTitle = document.createElement('td');
    const tdDescription = document.createElement('td');
    const table = document.querySelector('#main-feed-table');

    tdTitle.append(mainTitle);
    tdDescription.append(mainDescription);
    tr.append(tdTitle, tdDescription);
    table.append(tr);

    const articles = [...xml.querySelectorAll('item')];
    feedData[mainTitle] = articles;
    processingNewsArticles(mainTitle, articles);
  }
};

const button = document.body.querySelector('button');
const textInput = document.body.querySelector('input');

textInput.addEventListener('input', (event) => {
  userInput = event.target.value;
  const inputEl = event.target;
  validateUserInput(inputEl);
});

button.addEventListener('click', (e) => {
  e.preventDefault();
  if (isURL(userInput)) {
    textInput.value = '';

    axios.get(userInput)
      .then((response) => {
        const xml = parseXML(response.data);
        xmlProcessing(xml);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});
