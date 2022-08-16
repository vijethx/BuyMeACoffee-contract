// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract BuyMeACoffee {
    // event to emit when a memo is created
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // address of the contract holder, marked payable so that we can withdraw to this address later
    address payable owner;

    // List of all memos recieved from coffee purchases
    Memo[] memos;

    constructor() {
        // store the address of the deployer as a payable address. when we withdraw funds, we'll withdraw here
        owner = payable(msg.sender);
    }

    /**
     * @dev fetches all stored memos
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    /**
     * @dev buy a coffee for owner (sends an ETH tip and leaves a memo)
     * @param _name name of the coffee purchaser
     * @param _message a nice message from the purchaser
     */
    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        // must accept more than 0 ETH for a coffee
        require(msg.value > 0, "Can't buy coffee for free");

        // add the memo to the storage
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        // emit a NewMemo event with details about the memo
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev send the entire balance stored in this contract to the owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }
}
