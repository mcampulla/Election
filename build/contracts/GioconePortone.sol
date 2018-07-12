pragma solidity ^0.4.21;


/// REALTHIUM inc.
contract GioconePortone {
    event WonEvent(bool Status, uint Prize, uint Bet);
    
    struct DoorSet {
        uint id;
        uint doorNumber;
        uint doorWinner;        
        uint prize;
    }

    struct GamePlayed {
        uint doorSet;
        uint door;
        uint prize;
        bool winner;
    }

    struct PlayerStat {
        uint totalBet;
        uint totalPrize;
        uint totalWin;
        uint totalPlays;
    }

    address public owner;

    uint public doorSetCount;
    uint public playsCount;
    mapping(uint => DoorSet) public doorSets;
    mapping(uint => GamePlayed) public plays;
    mapping(address => PlayerStat) public players;

    // Initialize
    // Constructor is called only once and can not be called again (Ethereum Solidity specification)
    constructor() public {	
        addDoorSet(6, 2, 1);
        addDoorSet(6, 1, 2);
        addDoorSet(6, 4, 1);
        addDoorSet(6, 5, 3);
        addDoorSet(6, 3, 1);
        addDoorSet(6, 4, 2);
        addDoorSet(6, 2, 4);
    }

    function addPlay(GamePlayed play) private {
        playsCount++;
        plays[playsCount] = play;
    }

    function addDoorSet(uint _doorNumber, uint _doorWinner, uint _winnerPrize) private {
        doorSetCount ++;
        doorSets[doorSetCount] = DoorSet(doorSetCount, _doorNumber, _doorWinner, _winnerPrize);
    }

    function updatePlayerStat(address player, uint bet, bool winner, uint prize) private {
        PlayerStat memory ps = PlayerStat(0, 0, 0, 0);       
        if (players[player].totalPlays == 0) {
            ps = players[player];
        } 
        ps.totalBet += bet;
        ps.totalPrize += ps.totalPrize + (winner ? prize * bet : 0);
        ps.totalWin = ps.totalWin + (winner ? 1 : 0);
        ps.totalPlays++;
        players[player] = ps;
    }
    
    function getPlay() public view returns (uint _setdoor, uint _totaldoor) {
        uint val;
        val = 2; //block.number % doorSetCount;
        return(val, doorSets[val].doorNumber);
    }
    
    function play(uint _setdoor, uint _numberdoor) payable public {
        GamePlayed memory gp = GamePlayed(_setdoor, _numberdoor, 0, false);
        
        DoorSet memory ds = doorSets[_setdoor];
        if (ds.doorWinner == _numberdoor) {
            gp.winner = true;
            gp.prize = ds.prize;
            msg.sender.transfer(msg.value*ds.prize);
        } else {
            gp.winner = false;
            gp.prize = 0;
        }
        addPlay(gp);

        updatePlayerStat(msg.sender, msg.value, gp.winner, gp.prize);

        emit WonEvent(gp.winner, (gp.winner ? gp.prize : 0), msg.value);
    }
}