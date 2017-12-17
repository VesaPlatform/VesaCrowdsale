pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/token/BurnableToken.sol';

contract VesaToken is StandardToken, BurnableToken {

    string public name = "Vesa Token";
    string public symbol = "VSA";
    uint256 public decimals = 18;
    uint256 public INITIAL_SUPPLY = 40000000 * (10 ** decimals);

    function VesaToken() public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

}