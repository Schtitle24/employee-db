const db = require('./db');

// Function to execute a simple query
const executeQuery = (query) => {
  return db.query(query);
};

// Function to fetch all rows from a table
const getAllRows = (tableName) => {
  const query = `SELECT * FROM ${tableName}`;
  return executeQuery(query);
};

// Function to fetch all departments
const getAllDepartments = () => {
  const query = 'SELECT * FROM department';
  return executeQuery(query).then(([rows, fields]) => ({ rows, fields }));
};

// Function to fetch all roles
const getAllRoles = () => {
  const query = 'SELECT role.*, department.name AS department_name FROM role JOIN department ON role.department_id = department.id';
  return executeQuery(query).then(([rows, fields]) => ({ rows, fields }));
};

// Function to fetch all employees
const getAllEmployees = () => {
  const query = `
    SELECT employee.first_name, employee.last_name, role.title, department.name AS department_name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;
  return executeQuery(query);
};

//Function to inster a new department
const addDepartment = (name) => {
  const query = `INSERT INTO department (name) VALUES ('${name}')`;
  return executeQuery(query);
};

// Function to insert a new role
const addRole = (title, salary, departmentId) => {
  const query = `INSERT INTO role (title, salary, department_id) VALUES ('${title}', ${salary}, ${departmentId})`;
  return executeQuery(query);
};

//Function to insert a new employee
const addEmployee = (firstName, lastName, roleId, managerId) => { 
  const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', ${roleId}, ${managerId})`;
  return executeQuery(query);
};

//Function to update employee role
const updateEmployeeRole = (employeeId, roleId) => {
  const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
  const values = [roleId, employeeId];
  return executeQuery(query, values);
};

//


module.exports = {
  getAllEmployees,
  getAllRoles,
  getAllDepartments,
  executeQuery,
  getAllRows,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole
};