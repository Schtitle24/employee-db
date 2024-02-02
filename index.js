const inquirer = require('inquirer');
const {
  getAllDepartments,
  getAllRoles,
  getAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole
} = require('./db/queries');

// Prompt user for action selection
function promptForAction() {
  inquirer
    .prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ],
    })
    .then((answers) => {
      // Handle user's choice
      switch (answers.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          promptAddDepartment();
          break;
        case 'Add a role':
          promptAddRole();
          break;
        case 'Add an employee':
          promptAddEmployee();
          break;
        case 'Update an employee role':
          promptUpdateEmployeeRole();
          break;
        case 'Exit':
          console.log('Goodbye!');
          process.exit();
          break;
        default:
          console.log('Invalid choice');
          promptForAction();
      }
    });
}

// Implement functions for each action

function viewAllDepartments() {
  getAllDepartments()
    .then(({ rows, fields }) => {
      const departments = rows.map(row => ({ 
        Name: row.name
      }));
      console.table(departments);
      promptForAction();
    })
    .catch((err) => {
      console.error('Error fetching departments:', err);
      promptForAction();
    });
}

function viewAllRoles() {
  getAllRoles()
    .then(({rows, fields}) => {
      const roles = rows.map(row => ({
        Title: row.title,
        Department: row.department_name,
        Salary: row.salary
      }));
      console.table(roles);
      promptForAction();
    })
    .catch((err) => {
      console.error('Error fetching roles:', err);
      promptForAction();
    });
}

function viewAllEmployees() {
  getAllEmployees()
    .then(([rows, fields]) => {
      const employees = rows.map(row => ({ 
        First: row.first_name,
        Last: row.last_name,
        Title: row.title,
        Department: row.department_name,
        Salary: row.salary, 
        Manager: row.manager
      }))
      console.table(employees);
      promptForAction();
    })
    .catch((err) => {
      console.error('Error fetching employees:', err);
      promptForAction();
    });
}

function promptAddDepartment() {
  inquirer
    .prompt({
      type: 'input',
      name: 'name',
      message: 'Enter the name of the department:',
    })
    .then((answers) => {
      addDepartment(answers.name)
        .then(([result, fields]) => {
          console.log('New department added:', result);
          promptForAction();
        })
        .catch((err) => {
          console.error('Error adding department:', err);
          promptForAction();
        });
    });
}

function promptAddRole() {
  // Fetch the current list of departments from the database
  getAllDepartments()
    .then((allDepartments) => {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Enter the role of the employee:',
          },
          {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary of the employee:',
          },
          {
            type: 'list',
            name: 'department',
            message: 'Select the department of the employee:',
            choices: allDepartments.rows.map((department) => department.name),
          },
        ])
        .then((answers) => {
          // Find the department object based on the selected department name
          const selectedDepartment = allDepartments.rows.find(
            (department) => department.name === answers.department
          );

          if (!selectedDepartment) {
            console.error('Selected department not found');
            promptForAction();
            return;
          }

          // Use the department_id associated with the selected department
          const departmentId = selectedDepartment.id;

          // Call addRole with the corrected department_id
          addRole(answers.name, answers.salary, departmentId)
            .then(([result, fields]) => {
              console.log('New role added:', result);
              promptForAction();
            })
            .catch((err) => {
              console.error('Error adding role:', err);
              promptForAction();
            });
        });
    })
    .catch((err) => {
      console.error('Error fetching departments:', err);
      promptForAction();
    });
}

function promptAddEmployee() {
  // Fetch the current list of roles from the database
  getAllRoles()
    .then((roles) => {
      // Check if roles is an object with 'rows' property
      const roleRows = roles.rows || [];

      inquirer
        .prompt([
          {
            type: 'input',
            name: 'firstName',
            message: 'Enter the first name of the employee:',
          },
          {
            type: 'input',
            name: 'lastName',
            message: 'Enter the last name of the employee:',
          },
          {
            type: 'list',
            name: 'roleId',
            message: 'Select the role of the employee:',
            choices: roleRows.map((role) => role.title),
          },
          {
            type: 'input',
            name: 'managerId',
            message: 'Enter the manager id of the employee (leave blank if none):',
          },
        ])
        .then((answers) => {
          // Use the answers to add an employee
          const selectedRole = roleRows.find((role) => role.title === answers.roleId);

          if (!selectedRole) {
            console.error('Selected role not found');
            promptForAction();
            return;
          }

          // Use the role_id associated with the selected role
          const roleId = selectedRole.id;

          // Use the provided managerId or set it to NULL if blank
          const managerId = answers.managerId.trim() === '' ? 'NULL' : answers.managerId;

          // Call addEmployee with the corrected information
          addEmployee(answers.firstName, answers.lastName, roleId, managerId)
            .then(([result, fields]) => {
              console.log('New employee added:', result);
              promptForAction();
            })
            .catch((err) => {
              console.error('Error adding employee:', err);
              promptForAction();
            });
        });
    })
    .catch((err) => {
      console.error('Error fetching roles:', err);
      promptForAction();
    });
}

function promptUpdateEmployeeRole() {
  // Fetch the current list of employees and roles from the database
  Promise.all([getAllEmployees(), getAllRoles()])
    .then(([employees, roles]) => {
      // Check if employees and roles are objects with 'rows' property
      const employeeRows = employees.rows || [];
      const roleRows = roles.rows || [];

      console.log('Employees:', employeeRows); // Add this line to log employees

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee whose role you want to update:',
            choices: employeeRows.map((employee) => ({
              name: `${employee.first} ${employee.last}`,
              value: employee.id,
            })),
          },
          {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role:',
            choices: roleRows.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
        ])
        .then((answers) => {
          // Use the answers to update the employee role
          updateEmployeeRole(answers.employeeId, answers.roleId)
            .then(([result, fields]) => {
              console.log('Employee role updated:', result);
              promptForAction();
            })
            .catch((err) => {
              console.error('Error updating employee role:', err);
              promptForAction();
            });
        });
    })
    .catch((err) => {
      console.error('Error fetching employees or roles:', err);
      promptForAction();
    });
}


// Start the application by prompting the user for the first action
promptForAction();