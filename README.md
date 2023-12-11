# Pricing Web Interface

Welcome to the documentation for the simple inventory pricing database web interface developed for in-house use at Mardens Inc.

## Table of Contents
1. [Dependencies](#dependencies)
2. [Usage](#usage)
3. [API Endpoints](#api-endpoints)
   - [auth.php](#authphp)
   - [db.php](#dbphp)
   - [location.php](#locationphp)
   - [locations.php](#locationsphp)
4. [Contribution](#contribution)
5. [License](#license)

## Dependencies

To get started, make sure to install the required dependencies using Composer. You can do this by running the following command:

```bash
composer install
```

For a detailed list of dependencies, please refer to [composer.json](composer.json).

## Usage

To run the web interface, start the PHP server with the following command:

```bash
php -S localhost:8080
```

## [API Endpoints](/api/)

### [`auth.php`](/api/auth.php)

Handles the user authentication system

### [`location.php`](/api/location.php)

Handles individual location databases

### [`locations.php`](/api/locations.php)

Handles the list of location databases

## Contribution

This project is open for contributions, but please note that contributions are restricted to employees of [Mardens Inc](https://mardens.com).

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE). Please make sure to review the license terms before using or contributing to this project. If you have any questions, contact the [Mardens Inc](https://mardens.com) legal team.