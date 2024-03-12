/**The task is to insert a data in a linked list such that it will always remain sorted.
 * 
 * Ex: say ll = 1->2->9 and data=8 
 * So 8 should be inserted between 2 & 9 such that the linked list becomes
 * 
 * ll = 1->2->8->9
 * 
 * ex: ll = 10->20->30->40, data = 25
 * ll = 10->20->25->30->40
 * 
 * ex: ll = 10->15, data=5
 * ll = 5->10->15
 * 
 * ex: ll = 10->20, data=30
 * ll = 10->20->30
 * 
 */

class Node {
    constructor(data, next = null) {
        this.data = data;
        this.next = next;
    }
}
class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    /**0(n),0(1)
     * 
     * Case1: When the head is null, then simply whatever is the data it has to be inserted as the hed of the ll.
     * this.head === null then this.head=node;
     * 
     * Case2: Say ll = 10->15, data is 5
     * Lets maintain a current and prev pointer such that current is this.head and prev is null
     * Now we traverse such that current!==null
     * 
     * If at any point we see current.data>data we break, else we keep moving ahead prev= current & current= current.next.
     * 
     * In above case the prev will be null and current will be head.
     * Simply its a case of adding a node at beginning of linked list.
     * 
     * node.next = this.head & this.head=node.
     * 
     * Case3: Say ll = 10->15 data is 20
     * 
     * Again by the concept of current and prev pointer,
     * The current pointer will be null and prev pointer will be at the last node.
     * Its simple case insertion at end.
     * 
     * this.prev.next = node.
     * 
     * Case4: ll= 10->15, data=12
     * 
     * Now the prev will not be null and will be at the node after which this new data node needs to be inserted and the current 
     * will be at the node before which this new node has to be inserted, so its a simple case of insertion of node between two nodes.
     * 
     * node.next = current;
     * perv.next = node;
     */
    insertSorted(data) {
        let node = new Node(data);
        if (this.head === null) {
            this.head = node;
        } else {
            let current = this.head;
            let prev = null
            while (current !== null) {
                if (current.data < data) {
                    prev = current;
                    current = current.next;
                } else {
                    break;
                }
            }
            if (prev === null && current !== null) {
                node.next = this.head;
                this.head = node;
            } else if (prev !== null && current === null) {
                prev.next = node;
            } else {
                node.next = current;
                prev.next = node;
            }
        }
    }
    print() {
        if (this.head === null) {
            return;
        }
        let current = this.head;
        while (current !== null) {
            console.log(current.data);
            current = current.next;
        }
    }
}
let ll = new LinkedList();
ll.insertSorted(10);
// ll.insertSorted(20);
// ll.insertSorted(30);
ll.print();