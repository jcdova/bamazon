var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'niners#1',
    database: 'bamazonDB'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    dispSaleItems();
});

function dispSaleItems() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("\n------------------------------------------------\n");
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].item_id + " | "
       + res[i].product_name + " | " 
       + res[i].department_name + " | "
       + res[i].price + " | "
       + res[i].stock_quantity + " |" +
       + res[i].product_sales
      );
    }
    console.log("\n------------------------------------------------\n");
    buyQuestion();
  });
};

function buyQuestion() {
  inquirer.prompt([
  {
    name: "choice",
    message: "Would you like to buy anything. Enter 'Yes' for (Yes) or 'n' for (No)?"
  }

  ]).then(function(answers) {
    if (answers.choice === "n") {
      console.log("Have a Good Day");
      connection.end();
    } else if (answers.choice === "y") {
      getData();
    }  
  })
};

function getData() {
    connection.query("SELECT * FROM products", function (error, data) {
        if (error) throw error;
        getUserPrompt(data);
    });
}

function getUserPrompt(data) {
    var options = [];
    for (j in data) {
        options[j] = data[j].item_id + " : " + data[j].product_name;
    }
    inquirer.prompt([
        {
            type: "list",
            name: "productId",
            message: "Which item would you like to buy?",
            choices: options,
        },
        {
            type: "input",
            name: "quantity",
            message: "How many would you like to purchase?"
        }
    ]).then(function (userInput) {

        var product = userInput.productId.split(" :");
        var productId = product[0];

        connection.query("SELECT * FROM products WHERE ?",
            [{ item_id: productId }],
            function (error, data) {
                if (error) throw error;
                checkStock(data, userInput.quantity);
            });
    });

    function checkStock(data, quantity) {
        if (data[0].stock_quantity < quantity) {
            console.log("Sorry we do not have enough items in stock. Please view how many items are remaining.");
            console.log("\n----------------------------------------\n");
            dispSaleItems();
        } else {
            updateDB(data, quantity);
            updateSale(data, quantity);
            totalCost(data, quantity);
        }
    };

    function updateDB(data, quantity) {
        var quantity_left = data[0].stock_quantity - quantity;
        connection.query("UPDATE products SET ? WHERE ?",
            [
                { stock_quantity: quantity_left },
                { item_id: data[0].item_id }
            ],
            function (error, data) {
                if (error) throw error;
            });
    };

    function updateSale(data, quantity) {
        var totalSale = data[0].product_sales + data[0].price * quantity;
        connection.query("UPDATE products SET ? WHERE ?",
            [
            	{ product_sales: totalSale },
                { item_id: data[0].item_id } 
            ],
            function (error, data) {
                if (error) throw error;
            });
    };


    function totalCost(data, quantity) {
        console.log("\n--------------------------------------------\n");
        console.log("Product   : " + data[0].product_name);
        console.log("Price     : " + data[0].price);
        console.log("Quantity  : " + quantity);
        console.log("Total Cost: " + data[0].price * quantity);
        console.log("\n--------------------------------------------\n");
        dispSaleItems();
    }
}