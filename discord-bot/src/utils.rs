use std::fmt;

use cainome::cairo_serde_derive::CairoSerde;
use num_enum::FromPrimitive;
use starknet_crypto::Felt;

const FELT_CENTER: u32 = 2147483646;
const SQUARE_SIZE: u32 = 1_000_000;
const HALF_SQUARE_SIZE: u32 = SQUARE_SIZE / 2;

#[derive(CairoSerde, Debug)]
pub struct Position {
    x: u32,
    y: u32,
}

impl Position {
    pub fn new(x: u32, y: u32) -> Self {
        Position { x, y }
    }

    pub const fn get_contract(&self) -> (i32, i32) {
        let normalized = ((self.x as i64 - FELT_CENTER as i64).abs() > HALF_SQUARE_SIZE as i64)
            || ((self.y as i64 - FELT_CENTER as i64).abs() > HALF_SQUARE_SIZE as i64);

        if normalized {
            (self.x as i32, self.y as i32)
        } else {
            (
                self.x as i32 + FELT_CENTER as i32,
                self.y as i32 + FELT_CENTER as i32,
            )
        }
    }

    pub fn get_normalized(&self) -> (i32, i32) {
        let normalized = ((self.x as i64 - FELT_CENTER as i64).abs() > HALF_SQUARE_SIZE as i64)
            || ((self.y as i64 - FELT_CENTER as i64).abs() > HALF_SQUARE_SIZE as i64);

        if normalized {
            (self.x as i32, self.y as i32)
        } else {
            let x = (self.x as i64 - FELT_CENTER as i64) as i32;
            let y = (self.y as i64 - FELT_CENTER as i64) as i32;
            (x, y)
        }
    }
}

impl fmt::Display for Position {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Position({}, {})", self.x, self.y)
    }
}

pub fn felt_to_string(felt: &Felt) -> eyre::Result<String> {
    Ok(String::from_utf8(felt.to_bytes_be().to_vec())?
        .trim_start_matches('\0')
        .to_string())
}

#[derive(FromPrimitive, Debug, Clone, Copy, strum_macros::Display)]
#[repr(u8)]
pub enum ResourceIds {
    #[num_enum(default)]
    Unknown,
    Stone = 1,
    Coal = 2,
    Wood = 3,
    Copper = 4,
    Ironwood = 5,
    Obsidian = 6,
    Gold = 7,
    Silver = 8,
    Mithral = 9,
    AlchemicalSilver = 10,
    ColdIron = 11,
    DeepCrystal = 12,
    Ruby = 13,
    Diamonds = 14,
    Hartwood = 15,
    Ignium = 16,
    TwilightQuartz = 17,
    TrueIce = 18,
    Adamantine = 19,
    Sapphire = 20,
    EtherealSilica = 21,
    Dragonhide = 22,
    AncientFragment = 29,
    Donkey = 249,
    Knight = 250,
    Crossbowman = 251,
    Paladin = 252,
    Lords = 253,
    Wheat = 254,
    Fish = 255,
}
