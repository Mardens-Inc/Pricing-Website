<?php

/**
 * UserPermission Enum represents different user permissions.
 */
enum UserPermission: int
{
        // Gives all permissions
    case All = 0;

        // Allows the modification of database items
    case Modify = 1;

        // Allows the creation of new directory databases
    case Create = 2;

        // Allows the removal of directory databases
    case Delete = 3;

        // Allows the insertion of new database items
    case Insert = 4;

        // Allows the creation of new users
    case CreateUsers = 5;

        // Allows the modification of users
    case ModifyUsers = 6;

        // Allows the removal of users
    case DeleteUsers = 7;

        // Allows the viewing of users
    case ViewUsers = 8;
}
