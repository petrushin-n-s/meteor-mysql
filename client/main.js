import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import './main.html';

Template.babelshark.onRendered(function helloOnRendered() {
  const targetNode = this.find("#customers_table")
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
})

Template.babelshark.onCreated(function helloOnCreated() {
  const sub = Meteor.subscribe('customers', () => {
    //onReady
    const customers = new Mongo.Collection('customers').find().fetch();
    this.customers = new ReactiveVar(customers);
  });

  this.sub = new ReactiveVar(sub);
});

Template.babelshark.helpers({
  counter() {
    return Template.instance().counter.get();
  },
  customers() {
    if (Template.instance().sub.get().ready())
      return Template.instance().customers.get();
    else
      return null;
  }
});

// Options for the observer (which mutations to observe)
const config = { characterData: true, childList: true, subtree: true };

/**
 * Checks if cell belongs to the desired class and translates the text inside the cell
 * @param {*} observer 
 * @param {*} cell 
 */
function translate(observer, cell) {
  if (cell.className === "__t") {
    observer.disconnect()
    Meteor.call('translate', cell.innerText, (err, res) => {
      if (err) {
        alert(err);
      } else {
        if (res)
          cell.innerHTML = res;
        else cell.innerHTML = "no translation";
      }
      observer.observe(cell, config)
    })
  }
}

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  console.log(mutationList)
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      //Что-то добавилось или удалилось в таблице
      const { addedNodes } = mutation;
      for (node of addedNodes) {
        if (node.tagName === "TBODY") {
          const childrens = node.children;
          for (children of childrens) {
            if (children.tagName === "TR") {
              //Добавлена строка таблицы
              const { cells } = children;
              for (cell of cells) {
                translate(observer, cell)
              }
            }
          }
        }
      }
    } else if (mutation.type === "characterData") {
      //Поменялся текст
      const node = mutation.target.parentNode;
      translate(observer, node)
    }
  }
};