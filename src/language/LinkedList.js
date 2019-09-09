class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  find(item) {
    //Start at the head
    let currNode = this.head;
    //Check the list
    if (!this.head) {
      return null;
    }
    //Check for the item
    while (currNode.value !== item) {
      if (currNode.next === null) {
        return null;
      }
      else {
        currNode = currNode.next;
      }
    }
    return currNode;
  }

  remove(item){
    if(!this.head){
      return null;
    }
    if(this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    let currNode = this.head;
    let previousNode = this.head;

    while((currNode !== null) && (currNode.value !== item)){
      previousNode = currNode;
      currNode = currNode.next;
    }
    if(currNode === null){
      console.log('Item not found');
      return;
    }
    previousNode.next = currNode.next;
  }

  insertBefore(ogItm, newItm) {
    if(!this.head){
      return null;
    } else {
      let currNode = this.head;
      let previousNode = this.head;
      while((currNode !== null) && (currNode.value !== ogItm)){
        previousNode = currNode;
        currNode = currNode.next;
      }
      if(currNode === null){
        console.log('Item not found');
        return;
      }
      if (currNode === this.head) {
        return this.insertFirst(newItm);
      }
      previousNode.next = new _Node(newItm, currNode);
    }
  }

  insertAfter(ogItm, newItm) {
    if(!this.head){
      return null;
    } else {
      let currNode = this.head;
      while((currNode !== null) && (currNode.value !== ogItm)){
        currNode = currNode.next;
      }
      if(currNode === null){
        console.log('Item not found');
        return;
      }
      currNode.next = new _Node(newItm, currNode.next);
    }
  }

  insertAt(pos, item) {
    if(!this.head){
      return null;
    } else {
      let currNode = this.head;
      let previousNode = this.head;
      for(let i=0; i<pos; i++){
        previousNode = currNode;
        currNode = currNode.next;
      }
      if(currNode === null){
        console.log('Position not valid');
        return;
      }
      previousNode.next = new _Node(item, currNode);
    }
  }
}

class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

module.exports = LinkedList;