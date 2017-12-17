pragma solidity ^0.4.18;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

library SafeBonus {
    using SafeMath for uint256;

    function addBonus(uint256 value, uint256 percentages) internal pure returns (uint256) {
        return value.add(value.mul(percentages).div(100));
    }
}

contract Ownable {
    address public owner;


    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    function Ownable() public {
        owner = msg.sender;
    }


    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

}

interface token {
    function transfer(address receiver, uint amount) public;
}

contract VesaCrowdsale is Ownable {
    using SafeMath for uint256;
    using SafeBonus for uint256;

    // Pre ICO Init
    uint256 public startPreICO;
    uint256 public endPreICO;
    uint256 public preICODurationInDays = 31 days;
    uint256 public preICOSoftCap = 285 ether;
    uint256 public preICOHardCap = 1400 ether;
    uint256 public fundingPresaleIcoGoal = 285 ether;
    bool public fundingPresaleIcoGoalReached = false;
    bool public preICOClosed = false;

    // Crowdsale Init
    uint256 public startCrowdsale;
    uint256 public endCrowdsale;
    uint256 public crowdsaleDurationInDays = 31 days;
    uint256 public crowdsaleSoftCap = 3500 ether;
    uint256 public crowdsaleHardCap = 68500 ether;
    uint256 public fundingGoal = 3500 ether;
    bool public fundingGoalReached = false;
    bool public crowdsaleClosed = false;

    uint256 public minSum = 142857142900000000;
    address public beneficiary;
    uint256 public amountRaised;
    token public tokenReward;
    mapping(address => uint256) public balanceOf;


    event GoalReached(address recipient, uint totalAmountRaised);
    event FundTransfer(address backer, uint amount, bool isContribution);

    function VesaCrowdsale(
        address addressOfTokenUsedAsReward,
        address ifSuccessfulSendTo
    ) public {
        tokenReward = token(addressOfTokenUsedAsReward);
        beneficiary = ifSuccessfulSendTo;

        startPreICO = now;
        endPreICO = startPreICO.add(preICODurationInDays);
    }

    modifier afterPreIcoDeadline() {if (isAfterPreIcoDeadline()) _;}
    modifier afterPreIcoDeadlineAndBeforeCrowdsaleStart() {if (isAfterPreIcoDeadline() && endCrowdsale == 0) _;}
    modifier afterDeadline() {if (isAfterDeadline()) _;}
    modifier ifCrowdsaleNotStarted() {if (endCrowdsale == 0) _;}
    modifier ifPreIcoCanBeCompleted() {if (isPreIcoCanBeCompleted()) _;}
    modifier ifCrowdsaleCanBeCompleted() {if (isCrowdsaleCanBeCompleted()) _;}

    function activateCrowdsale() public onlyOwner ifCrowdsaleNotStarted {
        require(preICOClosed);
        startCrowdsale = now;
        endCrowdsale = startCrowdsale.add(crowdsaleDurationInDays);
    }

    //OK
    function atLeastOnePhaseIsActive() internal view returns (bool) {
        return isPreIcoActive() || isCrowdsaleActive();
    }

    //OK
    function isPreIcoActive() internal view returns (bool) {
        return !preICOClosed && now >= startPreICO && now <= endPreICO && !isCrowdsaleActive();
    }

    //OK
    function isCrowdsaleActive() internal view returns (bool) {
        return !crowdsaleClosed && endCrowdsale > 0 && now >= startCrowdsale && now <= endCrowdsale;
    }

    function isPreIcoCanBeCompleted() internal view returns (bool) {
        return (isAfterPreIcoDeadline() || isPreIcoHardCapAchived()) && !isCrowdsaleActive();
    }

    function isCrowdsaleCanBeCompleted() internal view returns (bool) {
        return (isAfterDeadline() || isCrowdsaleHardCapAchived());
    }

    function isPreIcoHardCapAchived() internal view returns (bool) {
        return amountRaised >= preICOHardCap;
    }

    function isPreIcoSoftCapAchived() internal view returns (bool) {
        return amountRaised >= preICOSoftCap;
    }

    function isCrowdsaleHardCapAchived() internal view returns (bool) {
        return amountRaised >= crowdsaleHardCap;
    }

    function isCrowdsaleSoftCapAchived() internal view returns (bool) {
        return amountRaised >= crowdsaleSoftCap;
    }

    function isAfterPreIcoDeadline() internal view returns (bool) {
        return now >= endPreICO;
    }

    function isAfterDeadline() internal view returns (bool) {
        return endCrowdsale > 0 && now >= endCrowdsale;
    }

    /**
     * Fallback function
     *
     * The function without name is the default function that is called whenever anyone sends funds to a contract
     */
    function() public payable {
        require(!preICOClosed);
        require(!crowdsaleClosed);
        require(atLeastOnePhaseIsActive());
        require(msg.value > minSum);
        uint256 amount = msg.value;
        balanceOf[msg.sender].add(amount);
        amountRaised.add(amount);

        uint256 price = getCurrentPrice();
        uint256 bonus = getCurrentBonus(amount);
        uint256 tokensToTransfer = amount.mul(10 ** 18).div(price);
        uint256 tokensToTransferWithBonuses = tokensToTransfer.addBonus(bonus);
        tokenReward.transfer(msg.sender, tokensToTransferWithBonuses);
        FundTransfer(msg.sender, amount, true);
    }

    function getCurrentPrice() public view returns (uint256) {
        uint8 activePhase = getActivePhase();
        if (activePhase == 2) {return phaseTwoPrice();}
        if (activePhase == 1) {return phaseOnePrice();}
        return 0;
    }

    function getCurrentBonus(uint256 amountInWei) public view returns (uint256) {
        uint8 activePhase = getActivePhase();
        if (activePhase == 2) {return phaseOneBonus(amountInWei);}
        if (activePhase == 1) {return phaseTwoBonus(amountInWei);}
        return 0;
    }

    function getActivePhase() public view returns (uint8) {
        if (isPreIcoActive()) return 1;
        if (isCrowdsaleActive()) return 2;
        return 0;
    }

    function phaseOnePrice() public view returns (uint256) {
        require(isPreIcoActive());

        uint256 price = 1857142857000000;
        uint256 diff = 28571428570000;

        if (now >= (startPreICO + 10 hours)) {
            // 0.00214285714285714 ETH
            price = 2142857142857140;
        } else {
            uint256 hoursLeft = now.sub(startPreICO).div(1 hours);
            price = price.add(diff.mul(hoursLeft));
        }

        return price;
    }

    function phaseOneBonus(uint256 amount) public pure returns (uint256) {
        if (amount < 2857142857000000000) {return 0;}
        // from 2.857142857 ETH to 7,142857143 ETH.
        if (amount >= 2857142857000000000 && amount < 7142857143000000000) {return 6;}
        // from 7,142857143 ETH to 14,28571429 ETH.
        if (amount >= 7142857143000000000 && amount < 14285714290000000000) {return 8;}
        // from 14,28571429 ETH to 25 ETH.
        if (amount >= 14285714290000000000 && amount < 25000000000000000000) {return 10;}
        // from 25 ETH to 85 ETH.
        if (amount >= 25000000000000000000 && amount < 85000000000000000000) {return 15;}
        // from 85 ETH to 285 ETH.
        if (amount >= 85000000000000000000 && amount < 285000000000000000000) {return 17;}
        // from 285 ETH.
        if (amount >= 285000000000000000000) {return 20;}
    }

    function phaseTwoPrice() public view returns (uint256) {
        require(now >= startCrowdsale && now < endCrowdsale);

        uint256 price = 2571428571000000;
        uint256 diff = 28571428570000;

        if (now >= (startCrowdsale + 5 hours)) {
            // 0.00257142857142857 ETH
            price = 2571428571428570;
        } else {
            uint256 hoursLeft = now.sub(startCrowdsale).div(1 hours);
            price = price.add(diff.mul(hoursLeft));
        }

        return price;
    }

    function phaseTwoBonus(uint256 amount) public pure returns (uint256) {
        if (amount < 2857142857000000000) {return 0;}
        // from 2.857142857 ETH to 7,142857143 ETH.
        if (amount >= 2857142857000000000 && amount < 7142857143000000000) {return 6;}
        // from 7,142857143 ETH to 14,28571429 ETH.
        if (amount >= 7142857143000000000 && amount < 14285714290000000000) {return 8;}
        // from 14,28571429 ETH to 25 ETH.
        if (amount >= 14285714290000000000 && amount < 25000000000000000000) {return 10;}
        // from 25 ETH to 85 ETH.
        if (amount >= 25000000000000000000 && amount < 85000000000000000000) {return 10;}
        // from 85 ETH to 285 ETH.
        if (amount >= 85000000000000000000 && amount < 285000000000000000000) {return 12;}
        // from 285 ETH.
        if (amount >= 285000000000000000000) {return 15;}
    }

    /**
     * Check if goal was reached
     *
     * Checks if the goal or time limit has been reached and ends the campaign
     */
    function checkPresaleIcoGoalReached() public ifPreIcoCanBeCompleted {

        if (isPreIcoHardCapAchived() || (isPreIcoSoftCapAchived() && isAfterPreIcoDeadline())) {
            fundingPresaleIcoGoalReached = true;
            GoalReached(beneficiary, amountRaised);
        }

        preICOClosed = true;
    }

    /**
     * Check if goal was reached
     *
     * Checks if the goal or time limit has been reached and ends the campaign
     */
    function checkGoalReached() public ifCrowdsaleCanBeCompleted {

        if (isCrowdsaleHardCapAchived() || (isCrowdsaleSoftCapAchived() && isAfterDeadline())) {
            fundingGoalReached = true;
            GoalReached(beneficiary, amountRaised);
        }

        crowdsaleClosed = true;
    }

    /**
     * Withdraw the funds
     *
     * Checks to see if goal or time limit has been reached, and if so, and the funding goal was reached,
     * sends the entire amount to the beneficiary. If goal was not reached, each contributor can withdraw
     * the amount they contributed.
     */
    function safePreIcoWithdrawal() public ifPreIcoCanBeCompleted {
        if (!fundingPresaleIcoGoalReached) {
            _userWithdrawal();
        }

        if (fundingPresaleIcoGoalReached && beneficiary == msg.sender) {
            if (beneficiary.send(amountRaised)) {
                FundTransfer(beneficiary, amountRaised, false);
            } else {
                //If we fail to send the funds to beneficiary, unlock funders balance
                fundingPresaleIcoGoalReached = false;
            }
        }
    }

    /**
     * Withdraw the funds
     *
     * Checks to see if goal or time limit has been reached, and if so, and the funding goal was reached,
     * sends the entire amount to the beneficiary. If goal was not reached, each contributor can withdraw
     * the amount they contributed.
     */
    function safeWithdrawal() public ifCrowdsaleCanBeCompleted {
        if (!fundingGoalReached) {
            _userWithdrawal();
        }

        if (fundingGoalReached && beneficiary == msg.sender) {
            if (beneficiary.send(amountRaised)) {
                FundTransfer(beneficiary, amountRaised, false);
            } else {
                //If we fail to send the funds to beneficiary, unlock funders balance
                fundingGoalReached = false;
            }
        }
    }

    function _userWithdrawal() internal {
        uint amount = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        if (amount > 0) {
            if (msg.sender.send(amount)) {
                FundTransfer(msg.sender, amount, false);
            } else {
                balanceOf[msg.sender] = amount;
            }
        }
    }

}