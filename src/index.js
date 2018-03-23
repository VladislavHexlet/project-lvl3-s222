import isURL from 'validator/lib/isURL';
import axios from 'axios';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';
import './style.css';

const state = {
  form: { userInput: '', isValid: false },
  visitedLinks: [],
  currentTableId: 0,
  feedData: {},
};

const validateUserInput = (userInput) => {
  if (isURL(userInput)) {
    state.form.isValid = true;
  } else {
    state.form.isValid = false;
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

const createNewsArticlesTable = (titleOfRssChannel) => {
  const table = document.createElement('table');
  table.setAttribute('id', `id-${state.currentTableId}`);
  table.setAttribute('class', 'table');
  const tBody = document.createElement('tBody');
  const titleTr = document.createElement('tr');
  const titleTh = document.createElement('th');
  table.append(tBody);
  tBody.append(titleTr);
  titleTr.append(titleTh);
  titleTh.append(titleOfRssChannel);

  state.currentTableId += 1;
  return table;
};

const addDescriptionForArticle = (button, articleDescription) => {
  $(button).on('click', () => {
    $('.modal-body').text(articleDescription);
  });
};

const createArticleTrElement = (article, button) => {
  const articleTr = document.createElement('tr');
  const articleTd = document.createElement('td');
  const articleA = document.createElement('a');
  const articleTitle = article.querySelector('title').textContent;
  const articleLink = article.querySelector('link').textContent;

  articleTr.append(articleTd);
  articleTd.append(articleA);
  articleTd.append(button);
  articleA.append(articleTitle);
  articleA.setAttribute('href', articleLink);

  return articleTr;
};

const prepareArticleForAddingToTable = (article) => {
  let articleDescription;
  const descriptionEl = article.querySelector('description');
  if (!descriptionEl) {
    articleDescription = 'No Description';
  } else {
    articleDescription = descriptionEl.textContent;
  }
  const button = createModalButton();
  const articleTr = createArticleTrElement(article, button);
  addDescriptionForArticle(button, articleDescription);
  return articleTr;
};

const addNewsArticlesToDom = (feed) => {
  const titleOfRssChannel = feed.querySelector('title').textContent;
  const articles = [...feed.querySelectorAll('item')];
  const jubmotron = document.body.querySelector('.jumbotron');
  const table = createNewsArticlesTable(titleOfRssChannel);
  jubmotron.append(table);
  articles.forEach((article) => {
    const articleTr = prepareArticleForAddingToTable(article);
    table.append(articleTr);
  });
};

const addFeedToDom = (feed) => {
  const title = feed.querySelector('title').textContent;
  let description = feed.querySelector('description').textContent;
  if (!(description)) {
    description = 'No Description';
  }
  const tr = document.createElement('tr');
  const tdElTitle = document.createElement('td');
  const tdElDescription = document.createElement('td');
  tdElTitle.append(title);
  tdElDescription.append(description);
  tr.append(tdElTitle, tdElDescription);

  const table = document.querySelector('#main-feed-table');
  table.append(tr);
};

const addFeedToState = (feed) => {
  const title = feed.querySelector('title').textContent;
  const articles = [...feed.querySelectorAll('item')];
  const setOfNewsLinks = new Set();

  articles.forEach((article) => {
    const link = article.querySelector('link').textContent;
    setOfNewsLinks.add(link);
  });
  state.feedData[title] = { id: state.currentTableId, setOfNewsLinks };
};

const checkNewsUpdates = () => {
  state.visitedLinks.forEach((link) => {
    axios.get(link)
      .then((response) => {
        const feed = parseXML(response.data);
        const newArticles = [...feed.querySelectorAll('item')];
        const title = feed.querySelector('title').textContent;
        const idOfNewsTable = state.feedData[title].id;
        const newsTable = document.querySelector(`#id-${idOfNewsTable}`);

        newArticles.forEach((newArticle) => {
          const linkOfNewArticle = newArticle.querySelector('link').textContent;
          if (!state.feedData[title].setOfNewsLinks.has(linkOfNewArticle)) {
            state.feedData[title].setOfNewsLinks.add(linkOfNewArticle);
            const articleTr = prepareArticleForAddingToTable(newArticle);
            const tbody = newsTable.querySelector('tbody');
            tbody.after(articleTr);
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

const button = document.body.querySelector('button');
const textInput = document.body.querySelector('input');

textInput.addEventListener('input', (event) => {
  state.form.userInput = event.target.value;
  validateUserInput(state.form.userInput);

  const inputEl = event.target;
  if (state.form.isValid || state.form.userInput.length === 0) {
    inputEl.classList.remove('is-invalid');
  } else {
    inputEl.classList.add('is-invalid');
  }
});

button.addEventListener('click', (e) => {
  e.preventDefault();
  if (state.form.isValid) {
    textInput.value = '';

    if (!state.visitedLinks.includes(state.form.userInput)) {
      axios.get(state.form.userInput)
        .then((response) => {
          state.visitedLinks = state.visitedLinks.concat(state.form.userInput);

          const feed = parseXML(response.data);
          addFeedToDom(feed);
          addFeedToState(feed);
          addNewsArticlesToDom(feed);
          state.form.userInput = '';
          state.form.isValid = false;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
});

const checkNewsUpdatesWrapper = () => {
  checkNewsUpdates();
  setTimeout(checkNewsUpdatesWrapper, 5000);
};

setTimeout(() => {
  checkNewsUpdatesWrapper();
}, 5000);
