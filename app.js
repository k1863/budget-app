//budgetController
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
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
        newItem = new Income(ID, des, val);
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

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (item) {
        return item.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
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

    calculatePercentage: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (item) {
        return item.getPercentage();
      });

      return allPerc;
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
    container: ".container",
    expPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  formatNumber = function (num, type) {
    var inc, dec, numSplit;
    /*add + or - before number, 2 decimal places
   and comma separating thousands   */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (
      (type === "exp" ? (sign = "-") : (sign = "+")) + " " + int + "." + dec
    );
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
        html = `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${
                              obj.description
                            }</div>
                            <div class="right clearfix">
                                <div class="item__value">
                                ${formatNumber(obj.value, type)}
                                </div>
                                <div class="item__percentage">23%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
      } else if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${
                              obj.description
                            }</div>
                            <div class="right clearfix">
                                <div class="item__value">
                                ${formatNumber(obj.value, type)}
                                </div>   
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

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
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
      var type;

      obj.value > 0 ? type === "inc" : type === "exp";

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
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

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.expPercLabel);

      var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, year, months;

      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
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

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
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

      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);
    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseFloat(splitID[1]);

      //Delete from the data structure
      budgetController.deleteItem(type, ID);

      //Delete the item from the UI
      UIController.deleteListItem(itemID);

      //Update and show the new budget
      updateBudget();
    }
  };

  var updatePercentages = function () {
    //1. Calculate the percentage
    budgetController.calculatePercentage();

    //2. Read percentages from the budget controller
    var percentages = budgetController.getPercentages();

    //3. Update the UI with the new percentages
    UIController.displayPercentages(percentages);
  };

  return {
    init: function () {
      console.log("app has started");
      setupEventListeners();
      UIController.displayMonth();
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
