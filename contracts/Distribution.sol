pragma solidity >=0.5.0 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Distribution is Ownable {
  IERC20 public token;

  constructor(
    IERC20 _token
  ) public {
    token = _token;
  }

  function distribute(
    address[] memory addresses,
    uint256[] memory amounts
  ) public {
    require(addresses.length == amounts.length, "Addresses and amounts do not have the same length");
    for (uint256 i = 0; i < addresses.length; i++) {
      token.transferFrom(msg.sender, addresses[i], amounts[i]);
    }
  }

  function destroy() public onlyOwner {
    selfdestruct(msg.sender);
  }
}