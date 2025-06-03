// Dojo achievements import
use achievement::types::task::{Task, TaskTrait};

// Into trait import
use core::traits::Into;

// Achievement enum
#[derive(Copy, Drop)]
pub enum Achievement {
    None,
    MiniGamer,
    MasterGamer,
    LegendGamer,
    AllStarGamer,
    SenseiGamer,
}

#[generate_trait]
pub impl AchievementImpl of AchievementTrait {
    #[inline]
    fn identifier(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
            Achievement::MiniGamer => 'MiniGamer', // Execute an action once
            Achievement::MasterGamer => 'MasterGamer', // Execute an action 10 times
            Achievement::LegendGamer => 'LegendGamer', // Execute an action 20 times
            Achievement::AllStarGamer => 'AllStarGamer', // Execute an action 30 times
            Achievement::SenseiGamer => 'SenseiGamer', // Execute an action 50 times
        }        
    }

    #[inline]
    fn hidden(self: Achievement) -> bool {
        match self {
            Achievement::None => true,
            Achievement::MiniGamer => false,
            Achievement::MasterGamer => false,
            Achievement::LegendGamer => false,
            Achievement::AllStarGamer => false,
            Achievement::SenseiGamer => false,
        }
    }

    #[inline]
    fn index(self: Achievement) -> u8 {
        match self {
            Achievement::None => 0,
            Achievement::MiniGamer => 0,
            Achievement::MasterGamer => 1,
            Achievement::LegendGamer => 2,
            Achievement::AllStarGamer => 3,
            Achievement::SenseiGamer => 4,
        }
    }

    #[inline]
    fn points(self: Achievement) -> u16 {
        match self {
            Achievement::None => 0,
            Achievement::MiniGamer => 10,
            Achievement::MasterGamer => 15,
            Achievement::LegendGamer => 25,
            Achievement::AllStarGamer => 35,
            Achievement::SenseiGamer => 50,
        }
    }

    #[inline]
    fn start(self: Achievement) -> u64 {
        match self {
            Achievement::None => 0,
            Achievement::MiniGamer => 0,
            Achievement::MasterGamer => 0,
            Achievement::LegendGamer => 0,
            Achievement::AllStarGamer => 0,
            Achievement::SenseiGamer => 0,
        }
    }

    #[inline]
    fn end(self: Achievement) -> u64 {
        match self {
            Achievement::None => 0,
            Achievement::MiniGamer => 0,
            Achievement::MasterGamer => 0,
            Achievement::LegendGamer => 0,
            Achievement::AllStarGamer => 0,
            Achievement::SenseiGamer => 0,
        }
    }

    #[inline]
    fn group(self: Achievement) -> felt252 {
        match self {
            Achievement::None => 0,
            Achievement::MiniGamer => 'Lord Golem',
            Achievement::MasterGamer => 'Lord Golem',
            Achievement::LegendGamer => 'Lord Golem',
            Achievement::AllStarGamer => 'Lord Golem',
            Achievement::SenseiGamer => 'Lord Golem',
        }
    }

    #[inline]
    fn icon(self: Achievement) -> felt252 {
        match self {
            Achievement::None => '',
            Achievement::MiniGamer => 'fa-gamepad',
            Achievement::MasterGamer => 'fa-chess-knight',
            Achievement::LegendGamer => 'fa-dungeon',
            Achievement::AllStarGamer => 'fa-star',
            Achievement::SenseiGamer => 'fa-dragon',
        }
    }

    #[inline]
    fn title(self: Achievement) -> felt252 {
        match self {
            Achievement::None => '',
            Achievement::MiniGamer => 'Novice Explorer',
            Achievement::MasterGamer => 'Prodigy Player',
            Achievement::LegendGamer => 'Heroic Gamer',
            Achievement::AllStarGamer => 'Ultimate Champion',
            Achievement::SenseiGamer => 'The one and only',
        }
    }

    #[inline]
    fn description(self: Achievement) -> ByteArray {
        match self {
            Achievement::None => "",
            Achievement::MiniGamer => "You've played a game once, a true novice.",
            Achievement::MasterGamer => "You've played a game 10 times, a prodigy in the making.",
            Achievement::LegendGamer => "You've played a game 20 times, a heroic gamer.",
            Achievement::AllStarGamer => "You've played a game 30 times, an ultimate champion.",
            Achievement::SenseiGamer => "You've played a game 50 times, the one and only.",
        }
    }

    #[inline]
    fn tasks(self: Achievement) -> Span<Task> {
        match self {
            Achievement::None => [].span(),
            Achievement::MiniGamer => array![TaskTrait::new('MiniGamer', 1, "Play a game once.")].span(),
            Achievement::MasterGamer => array![TaskTrait::new('MasterGamer', 10, "Play a game 10 times.")].span(),
            Achievement::LegendGamer => array![TaskTrait::new('LegendGamer', 20, "Play a game 20 times.")].span(),
            Achievement::AllStarGamer => array![TaskTrait::new('AllStarGamer', 30, "Play a game 30 times.")].span(),
            Achievement::SenseiGamer => array![TaskTrait::new('SenseiGamer', 50, "Play a game 50 times.")].span(),
        }
    }

    #[inline]
    fn data(self: Achievement) -> ByteArray {
        ""
    }
}

pub impl IntoAchievementU8 of Into<Achievement, u8> {
    #[inline]
    fn into(self: Achievement) -> u8 {
        match self {
            Achievement::None => 0,
            Achievement::MiniGamer => 1,
            Achievement::MasterGamer => 2,
            Achievement::LegendGamer => 3,
            Achievement::AllStarGamer => 4,
            Achievement::SenseiGamer => 5,
        }
    }
}

pub impl IntoU8Achievement of Into<u8, Achievement> {
    #[inline]
    fn into(self: u8) -> Achievement {
        match self {
            0 => Achievement::None,
            1 => Achievement::MiniGamer,
            2 => Achievement::MasterGamer,
            3 => Achievement::LegendGamer,
            4 => Achievement::AllStarGamer,
            5 => Achievement::SenseiGamer,
            // Default case
            _ => Achievement::None,
        }
    }
}
