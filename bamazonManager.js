var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2'); //Creates a nice table

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

//runs all the manager actions
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
        }
        else if (managerChoice.managerOpt === "Add New Product") {
        	addProduct();
        }

    });

    //displays all the data 
    function dispSaleItems() {
    	var table = new Table({
	    head: ['Prod. ID', 'Prod. Name', 'Dept. Name', 'Price', 'Quantity'], 
	    colWidths: [10, 25, 18, 12, 14]
		});
  		connection.query("SELECT * FROM products", function(err, res) {
  		console.log("\n------------------------------------------------------------------\n");
		if (err) throw err;
	    for (var i = 0; i < res.length; i++) {

	    	table.push([
		    	res[i].item_id,
		        res[i].product_name, 
		        res[i].department_name,
		        res[i].price,
		        res[i].stock_quantity
		    	]);	
			};
			console.log(table.toString());
			console.log("\n------------------------------------------------------------------\n");
			connection.end();
		});
	};

	//displays all inventory less than 25 items
	function viewLowInventory() {
		var table = new Table({
	    head: ['Prod. ID', 'Prod. Name', 'Dept. Name', 'Price', 'Quantity'], 
	    colWidths: [10, 25, 18, 12, 14]
		});
		connection.query('SELECT * FROM products WHERE stock_quantity < 25', function(err, res) { 
		if (err) throw err;
		console.log("\n------------------------------------------------\n");
		for (var i = 0; i < res.length; i++) {
			table.push([
		    	res[i].item_id,
		        res[i].product_name, 
		        res[i].department_name,
		        res[i].price,
		        res[i].stock_quantity
		    	]);	
			};
			console.log(table.toString());
			console.log("\n------------------------------------------------\n");
			connection.end();
		});
	};

	//opbtains the data 
	function getData() {
    connection.query("SELECT * FROM products", function (error, data) {
        if (error) throw error;
        addInventory(data);
    });
	}

	//prompts user with a list of options utllizing table listings as options
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
            name: "quantity",
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

    //adds the quantity and displays data
    function addStock(data, quantity) {
       	updateDB(data, quantity);
        dispSaleItems();       
    };

    //updates the quantity
    function updateDB(data, quantity) {
    	var newQuantity = data[0].stock_quantity + quantity; 
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

	//adds the a new product by prompting the user
	function addProduct() {

        // prompts manager for product information to add to database
        inquirer.prompt([
            {
                type: "input",
                message: "Enter the Product Name:",
                name: "product_name"
            }, {
                type: "input",
                message: "Enter the Product Department:",
                name: "department_name"
            }, {
                type: "input",
                message: "Enter the Product Price:",
                name: "price"
            }, {
                type: "input",
                message: "Enter the Product Quantity:",
                name: "stock_quantity"
            }, {
            	type: "input",
                message: "Enter 0 for Product sales:",
                name: "product_sales"
            }
        ]).then(function(managerInput) {

            // Inserts new product
            connection.query('INSERT INTO products SET ?', {
                product_name: managerInput.product_name,
                department_name: managerInput.department_name,
                price: parseFloat(managerInput.price).toFixed(2),
                stock_quantity: parseInt(managerInput.stock_quantity),
                product_sales: parseInt(managerInput.product_sales)
            }, function(err, res) {
                if(err) throw err;
                console.log('');
                console.log('Product ' + managerInput.product_name + ' added.');
                console.log('');
            });
            dispSaleItems();
        });
        
    };
	

}
