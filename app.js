//budgetController
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (item) {
      sum = sum + item.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      ID = 0;

      //create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on type exp or inc
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else {
        newItem = new Expense(ID, des, val);
      }

      //push it into our data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    calculateBudget: function () {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the budget: income & expenses
      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        //calculate the percentage of income we spent
      } else {
        data.percentage = -1;
      }
    },

    testing: function () {
      console.log(data);
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
  };
})();

//UI Controller
var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHTML, element;
      //create HTML File
      if (type === "exp") {
        element = DOMStrings.expenseContainer;
        html = `<div class="item clearfix" id="expense-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${obj.value}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
      } else if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html = `<div class="item clearfix" id="income-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${obj.value}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
      }
      //Replace the placeholders with actual data
      // newHTML = html.replace("%id%", obj.id);
      // newHTML = newHTML.replace("%description%", obj.description);
      // newHTML = newHTML.replace("%value%", obj.value);

      //Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );
      console.log(fields);
      fieldsArr = Array.prototype.slice.call(fields);
      console.log(fieldsArr);

      fieldsArr.forEach(function (field) {
        field.value = "";
      });
    },

    displayBudget: function (obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    getDOMStrings: function () {
      return DOMStrings;
    },
  };
})();

//Global App Contoller
var controller = (function () {
  var setupEventListeners = function () {
    var DOM = UIController.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.key === 13 || e.keyCode === 13) {
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function () {
    //1. calculate budget
    budgetController.calculateBudget();

    //2. return budget
    var budget = budgetController.getBudget();

    //3. display the budget on the UI
    UIController.displayBudget(budget);
  };

  var ctrlAddItem = function ctrlAddItem() {
    var input, newItem;
    // 1. Get the input data
    input = UIController.getInput();
    console.log(input);

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );

      // 3. Add the item to the user interface
      UIController.addListItem(newItem, input.type);

      //4. clear the fields
      UIController.clearFields();

      // 5. calculate and update budget
      updateBudget();
    }
  };

  return {
    init: function () {
      console.log("app has started");
      setupEventListeners();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
    },
  };
})(budgetController, UIController);

controller.init();
