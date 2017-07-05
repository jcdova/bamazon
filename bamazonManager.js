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
    manageData();
});


function manageData() {
    inquirer.prompt([
        {
            type: "list",
            name: "managerOpt",
            message: "Select an option below:",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function (managerChoice) {

        if (managerChoice.managerOpt === "View Products for Sale") {
        	dispSaleItems();
        } 
        else if (managerChoice.managerOpt === "View Low Inventory") {
        	viewLowInventory();
        }
        else if (managerChoice.managerOpt === "Add to Inventory") {
        	getData();
        	// addInventory();
        }
        else if (managerChoice.managerOpt === "Add New Product") {
        	addProduct();
        }

    });

    function dispSaleItems() {
  	connection.query("SELECT * FROM products", function(err, res) {
  		console.log("\n------------------------------------------------\n");
		if (err) throw err;
	    for (var i = 0; i < res.length; i++) {
	      console.log(res[i].item_id + " | "
	       + res[i].product_name + " | " 
	       + res[i].department_name + " | "
	       + res[i].price + " | "
	       + res[i].stock_quantity
	      );
	    }
	console.log("\n------------------------------------------------\n");
	connection.end();
	});
	};

	function viewLowInventory() {	
	connection.query('SELECT * FROM products WHERE stock_quantity < 25', function(err, res) { 
		if (err) throw err;
		console.log("\n------------------------------------------------\n");
		for (var i = 0; i < res.length; i++) {
	      console.log(res[i].item_id + " | "
	       + res[i].product_name + " | " 
	       + res[i].department_name + " | "
	       + res[i].price + " | "
	       + res[i].stock_quantity
	      );	
		}
	console.log("\n------------------------------------------------\n");
	connection.end();
	});
	};

	function getData() {
    connection.query("SELECT * FROM products", function (error, data) {
        if (error) throw error;
        addInventory(data);
    });
	}

	function addInventory(data) {
    var options = [];
    for (j in data) {
        options[j] = data[j].item_id + " : " + data[j].product_name;
    }
    inquirer.prompt([
        {
            type: "list",
            message: "Select the Product:",
            name: "productId",
            choices: options,
        }, 
        {
            type: "input",
            message: "Enter the quantity you want to add:",
            name: "quantity"
        }
    ]).then(function (userInput) {

        var product = userInput.productId.split(" :");
        var productId = product[0];

        connection.query("SELECT * FROM products WHERE ?",
            [{ item_id: productId }],
            function (error, data) {
                if (error) throw error;
                addStock(data, userInput.quantity);
            });
    });

    function addStock(data, quantity) {
       	updateDB(data, quantity);
        dispSaleItems();       
    };

    function updateDB(data, quantity) {
    	var newQuantity = data[0].stock_quantity + quantity 
        connection.query("UPDATE products SET ? WHERE ?",
            [
                { stock_quantity: newQuantity },
                { item_id: data[0].item_id }
            ],
            function (error, data) {
                if (error) throw error;
            });
    }
	
	};

	
	function addProduct() {

        // Asks product info to insert on database
        inquirer.prompt([
            {
                type: "input",
                message: "Type the Product Name:",
                name: "product_name"
            }, {
                type: "input",
                message: "Select the Product Department:",
                // choices: dep,
                name: "department_name"
            }, {
                type: "input",
                message: "Type the Product Price:",
                name: "price"
            }, {
                type: "input",
                message: "Type the Product Quantity:",
                name: "stock_quantity"
            }
        ]).then(function(managerInput) {

            // Insert new product
            connection.query('INSERT INTO products SET ?', {
                product_name: managerInput.product_name,
                department_name: managerInput.department_name,
                price: parseFloat(managerInput.price).toFixed(2),
                stock_quantity: parseInt(managerInput.stock_quantity)
            }, function(err, res) {
                if(err) throw err;
                console.log('');
                console.log('Product ' + managerInput.name + ' added.');
                console.log('');
                // dispSaleItems(); 
            });
            dispSaleItems();
            // connection.end();
        });
        
    };
	

}
