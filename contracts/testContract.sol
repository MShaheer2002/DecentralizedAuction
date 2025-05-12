// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TestContract {
    string public message;

    constructor() {
        message = "Hello from the blockchain!";
    }

    function setMessage(string memory _message) public {
        message = _message;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}
