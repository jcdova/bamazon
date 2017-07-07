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
    superviseData();
});

//runs the all the surpervisor actions
function superviseData() {
    inquirer.prompt([
        {
            type: "list",
            name: "supervisorOpt",
            message: "Select an option below:",
            choices: ["View Products Sales by Department", "Create New Department"]
        }
    ]).then(function (supervisorChoice) {

        if (supervisorChoice.supervisorOpt === "View Products Sales by Department") {
        	dispSaleDept();
        } 
        else if (supervisorChoice.supervisorOpt === "Create New Department") {
        	createDept();
        }
    });

    //diplays all the data for all departments
    function dispSaleDept() {

    	var table = new Table({
	    head: ['Dept. ID', 'Dept. Name', 'OH Cost', 'Prod. Sales', 'Tot. Profit'], 
	    colWidths: [10, 12, 12, 14, 14]
		});

    	var query = "SELECT departments.department_id, departments.department_name, departments.over_head_cost, products.product_sales, ";
    	query += "(products.product_sales - departments.over_head_cost) AS total_profit ";
    	query += "FROM departments ";
    	query += "LEFT JOIN products ON departments.department_name = products.department_name ";
    	query += "ORDER BY products.department_name ";
  		connection.query(query, function(err, res) {
			console.log("\n--------------------------------------------------------------------\n");
			if (err) throw err;
		    for (var i = 0; i < res.length; i++) {
		    table.push([
		    	res[i].department_id,
		        res[i].department_name, 
		        res[i].over_head_cost,
		        res[i].product_sales,
		        res[i].total_profit
		    	]);	
			};
			console.log(table.toString());
			console.log("\n--------------------------------------------------------------------\n");
			connection.end();
		});
	};

	//creates the a department based on the user input
	function createDept() {

        // prompts supervisor for product information to add to database
        inquirer.prompt([
            {
                type: "input",
                message: "Enter the Deparment Name:",
                name: "department_name"
            }, {
                type: "input",
                message: "Enter the Over Head Cost:",
                name: "over_head_cost"
            }, {
                type: "input",
                message: "Enter the initial Profit, enter 0 if none:",
                name: "total_profit"
            }
        ]).then(function(supervisorInput) {

            // Inserts new product
            connection.query('INSERT INTO departments SET ?', {
                department_name: supervisorInput.department_name,
                over_head_cost: parseFloat(supervisorInput.over_head_cost).toFixed(2),
                total_profit: parseFloat(supervisorInput.total_profit).toFixed(2)    
            }, function(err, res) {
                if(err) throw err;
                console.log('');
                console.log('Department ' + supervisorInput.name + ' added.');
                console.log('');
            });
            dispSaleDept();
        });
        
    };



}