var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2'); //creates a nice table

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

//displays all the data
function dispSaleItems() {
	var table = new Table({
	    head: ['Prod. ID', 'Prod. Name', 'Dept. Name', 'Price', 'Quantity', 'Sales'], 
	    colWidths: [10, 25, 18, 12, 14, 12]
		});
  	connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("\n------------------------------------------------\n");
    for (var i = 0; i < res.length; i++) {

    	table.push([
			    res[i].item_id,
			    res[i].product_name, 
			    res[i].department_name,
			    res[i].price,
			    res[i].stock_quantity,
			    res[i].product_sales
		    	]);	
			};
		console.log(table.toString());
		console.log("\n------------------------------------------------\n");
    	buyQuestion();
  	});
};

//asks an intial question
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

//gets info from user
function getData() {
    connection.query("SELECT * FROM products", function (error, data) {
        if (error) throw error;
        getUserPrompt(data);
    });
}

//prompts user with a list of options utllizing table listings as options
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

    //checks to see if there is enough quantity based on the user input
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

    //updates the table with new quantity value
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

    //updates the tbale with new sales value
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

    //displays the most recent transaction
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