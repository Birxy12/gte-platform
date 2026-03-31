export const ARMY_RANKS = [
    "Private", "Private Second Class", "Private First Class", "Specialist", "Corporal", 
    "Sergeant", "Staff Sergeant", "Sergeant First Class", "Master Sergeant", "First Sergeant", 
    "Sergeant Major", "Command Sergeant Major", "Second Lieutenant", "First Lieutenant", "Captain"
];

export const getArmyRank = (friendsCount, reelsCount, hasBio) => {
    // Level 1 Requirements: 50 Friends, Bio Completed, 5 Reels
    const lv1Friends = 50; 
    const lv1Reels = 5;

    if (friendsCount >= lv1Friends && reelsCount >= lv1Reels && hasBio) {
        return {
            levelNum: 2,
            rankName: ARMY_RANKS[1],
            nextGoal: { friends: 100, reels: 10 }
        };
    }
    
    return {
        levelNum: 1,
        rankName: ARMY_RANKS[0],
        nextGoal: { friends: lv1Friends, reels: lv1Reels }
    };
};
