const API = (() => {
    const URL = "http://localhost:3000";
    const cart = "cart";
    const inventory = "inventory";
    const getCart = async () => {
        let cartURL = `http://localhost:3000/${cart}`;
        let response = await fetch(cartURL);
        response = await response.json();
        return response;
    };
  
    const getInventory = async () => {
      // define your method to get inventory data
        let inventoryURL = `http://localhost:3000/${inventory}`;
        let response = await fetch(inventoryURL);
        response = await response.json();
        return response;
    };
  
    const addToCart = async (inventoryItem) => {
      // define your method to add an item to cart
        let response = await fetch(`http://localhost:3000/${cart}`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "content": inventoryItem.content,
                "id": inventoryItem.id,
                "quantity": inventoryItem.quantity
            })
        });
        response = await response.json();
        return response;
    };
  
    const updateCart = async (id, newAmount, content) => {
      // define your method to update an item in cart
      let response = await fetch(`http://localhost:3000/${cart}/${id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "quantity": newAmount,
                "content": content
            })
        });
        response = await response.json();
        return response;
    };
  
    const deleteFromCart = async (id) => {
      // define your method to delete an item in cart
        let response = await fetch(`http://localhost:3000/${cart}/${id}`, {method: "DELETE"});
        response = await response.json();
        return response;
    };
  
    const checkout = () => {
      // you don't need to add anything here
      return getCart().then((data) =>
        Promise.all(data.map((item) => deleteFromCart(item.id)))
      );
    };
  
    return {
      getCart,
      updateCart,
      getInventory,
      addToCart,
      deleteFromCart,
      checkout,
    };
  })();
  
  const Model = (() => {
    // implement your logic for Model
    class State {
      #onChange;
      #inventory;
      #cart;
      #inventoryPage;
      #totalPerPage;
      #currPage;
      constructor() {
        this.#inventory = [];
        this.#cart = [];
        this.#inventoryPage = 0;
        this.#totalPerPage = 5;
        this.#currPage = 0;
      }

      get cart() {
        return this.#cart;
      }
  
      get inventory() {
        return this.#inventory;
      }

      get inventoryPage() {
        return this.#inventoryPage;
      }

      get currPage() {
        return this.#currPage;
      }

      get totalPerPage() {
        return this.#totalPerPage;
      }

      set currPage(page) {
        this.#currPage = page;
      }

      set inventoryPage(page) {
        this.#inventoryPage = page;
      }
  
      set cart(newCart) {
        this.#cart = newCart;
      }

      set inventory(newInventory) {
        this.#inventory = newInventory;
        // init cart has no quantity.
        this.#inventory = this.#inventory.map((item) => {
                if (item.quantity === undefined) {
                    item.quantity = 0;
                }
                return item;
            }
        );
      }
  
      subscribe(cb) {}
    }
    const {
      getCart,
      updateCart,
      getInventory,
      addToCart,
      deleteFromCart,
      checkout,
    } = API;
    return {
      State,
      getCart,
      updateCart,
      getInventory,
      addToCart,
      deleteFromCart,
      checkout,
    };
  })();
  
  const View = (() => {
    const inventoryContainerElem = document.querySelector(".inventory-container");
    const inventoryListElem = document.querySelector(".inventory-list");
    const cartListElem = document.querySelector(".cart-list");

    const getUIElem = (value) => {
        return document.querySelector(value);
    }

    const renderInventory = (inventoryList, currPage = 0, totalItems = 5) => {
        inventoryList = inventoryList.slice(
          Math.min(currPage*totalItems, inventoryList.length), 
          Math.min(currPage*totalItems + totalItems, inventoryList.length)
        );

        while (inventoryListElem.firstChild) {
            inventoryListElem.removeChild(inventoryListElem.firstChild);
        }

        inventoryList.forEach(element => {
            let li = document.createElement('li');
            li.className = "inventory-item";
            li.id = "inventory" + element.id;

            const deleteButton = document.createElement('button');
            deleteButton.innerText = '-';
            deleteButton.className = 'inventory-delete';

            const inventorySpan = document.createElement('span');
            inventorySpan.className = "inventory-name-span";
            inventorySpan.innerHTML = `${element.content}`;

            const inventoryQuantitySpan = document.createElement('span');
            inventoryQuantitySpan.className = "inventory-quantity-span";
            inventoryQuantitySpan.innerHTML = `${element.quantity}`;

            const addButton = document.createElement('button');
            addButton.innerText = '+';
            addButton.className = 'inventory-add';

            const addToCartButton = document.createElement('button');
            addToCartButton.innerText = 'add to cart';
            addToCartButton.className = 'cart-add';

            li.append(inventorySpan, deleteButton, inventoryQuantitySpan, addButton, addToCartButton);
            inventoryListElem.append(li);
        });
        
    };

    const renderPageChangeButtons = () => {
      const buttonItemSpan = document.createElement('span');
      buttonItemSpan.className = "button-span";

      const prevPageButton = document.createElement('button');
      prevPageButton.innerText = 'Prev';
      prevPageButton.className = 'prev-page';

      const nextPageButton = document.createElement('button');
      nextPageButton.innerText = 'Next';
      nextPageButton.className = 'next-page';

      buttonItemSpan.append(prevPageButton, nextPageButton);
      inventoryContainerElem.append(buttonItemSpan);
    }

    const renderCart = (cartList) => {
        while (cartListElem.firstChild) {
            cartListElem.removeChild(cartListElem.firstChild);
        }

        cartList.forEach(element => {
            let li = document.createElement('li');
            li.className = "cart-item";
            li.id = "cart" + element.id;

            const cartItemSpan = document.createElement('span');
            cartItemSpan.className = "cart-item-span";
            cartItemSpan.innerHTML = `${element.content} x ${element.quantity}`;
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'delete';
            deleteButton.className = 'cart-delete';

            li.append(cartItemSpan, deleteButton);
            cartListElem.append(li);
        });
    };

    const changePage = (inventoryList, pageChange = 0, currPage = 0, totalItems = 5) => {
      
      if (pageChange === -1) {
        let newPage = Math.max(currPage + pageChange, 0);
        if (newPage === currPage) 
          return;
        renderInventory(inventoryList, newPage, totalItems);
      } else if (pageChange === 1) {
        newPage = Math.min(currPage + pageChange, Math.floor(inventoryList.length / totalItems));
        if (newPage === currPage) 
          return;
        renderInventory(inventoryList, newPage, totalItems);
      }
    }

    return {getUIElem, renderInventory, renderCart, renderPageChangeButtons, changePage};
  })();
  
  const Controller = ((model, view) => {
    // implement your logic for Controller
    const state = new model.State();
  
    const init = async () => {
        state.cart = await model.getCart();
        state.inventory = await model.getInventory();
        state.inventory = state.inventory.map((item) => {
            if (item.quantity === undefined) {
                item.quantity = 0;
            }
            return item;
          }
        );
        state.currPage = 0
        view.renderInventory(state.inventory, state.currPage, state.totalItems);
        view.renderCart(state.cart);
        view.renderPageChangeButtons();
    };

    const handleUpdateAmount = () => {
        let element = view.getUIElem(".inventory-list");
        element.addEventListener("click", (event) => {
            const elem = event.target;
            event.preventDefault();
            if (elem.className === "inventory-delete") {
                const id = elem.parentElement.getAttribute("id");
                state.inventory = state.inventory.map((item) => {
                    if ("inventory" + item.id === id) {
                        item.quantity = Math.max(0, item.quantity - 1);
                    }
                    return item;
                })
                view.renderInventory(state.inventory, state.currPage, state.totalItems);
            } else if (elem.className === "inventory-add") {
                const id = elem.parentElement.getAttribute("id");
                state.inventory = state.inventory.map((item) => {
                    if ("inventory" + item.id === id) {
                        item.quantity += 1;
                    }
                    return item;
                })
                view.renderInventory(state.inventory, state.currPage, state.totalItems);
            }
        });
    };
  
    const handleAddToCart = () => {
        let element = view.getUIElem(".inventory-list");
        
        element.addEventListener("click", async (event) => {
            const elem = event.target;
            event.preventDefault();
            if (elem.className === "cart-add") {
                const id = elem.parentElement.getAttribute("id");
                let currInventory = state.inventory.filter((element) => {
                    if (element.quantity > 0 && "inventory" + element.id === id) {
                        return true;
                    }
                    return false;
                });

                if (currInventory.length === 0)
                    return;

                let val = state.cart.find(cartItem => cartItem.id === currInventory[0].id);
                if (val === undefined) {
                    await model.addToCart(currInventory[0]);
                    state.cart = [...state.cart, currInventory[0]];
                } else {
                    val.quantity += currInventory[0].quantity;
                    await model.updateCart(val.id, val.quantity, val.content);
                }
                // Array.prototype.some
                view.renderCart(state.cart);
            } 
        });
    };

    const handlePageChange = () => {
      let element = view.getUIElem(".button-span");
      element.addEventListener("click", async (event) => {
        const elem = event.target;
        if (elem.className === "prev-page") {
          view.changePage(state.inventory, -1, state.currPage, state.totalPerPage);
          state.currPage = Math.max(0, state.currPage - 1);
        } else if (elem.className === "next-page") {
          view.changePage(state.inventory, 1, state.currPage, state.totalPerPage);
          state.currPage = Math.min(Math.floor(state.inventory.length / state.totalPerPage), state.currPage + 1);
        }
      });

      return;
    }
  
    const handleDelete = () => {
        let element = view.getUIElem(".cart-list");
        element.addEventListener("click", async (event) => {
            event.preventDefault();
            const elem = event.target;
            
            if (elem.className === "cart-delete") {
                const id = elem.parentElement.getAttribute("id");
                let delId;
                state.cart = state.cart.filter((item) => {
                    if ("cart" + item.id === id) {
                        delId = item.id;
                        return false;
                    }
                    return true;
                });
                let res = await model.deleteFromCart(delId);
                if (res)
                    view.renderCart(state.cart); 
            }
            
        })
    };
  
    const handleCheckout = () => {
        let element = view.getUIElem(".cart-wrapper");
        element.addEventListener("click", async (event) => {
            event.preventDefault();
            const elem = event.target;
            
            if (elem.className === "checkout-btn") {
                state.cart.forEach(async (item) => {
                    let res = await model.deleteFromCart(item.id);
                })
                state.cart = [];
                view.renderCart(state.cart); 
            }
        });
    };

    const bootstrap = async () => {
        await init();
        handleUpdateAmount();
        handleAddToCart();
        handlePageChange();
        handleDelete();
        handleCheckout();
    };
    return {
      bootstrap,
    };
  })(Model, View);
  
  Controller.bootstrap();