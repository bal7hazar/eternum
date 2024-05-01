use array::SpanTrait;
use eternum::alias::ID;
use eternum::utils::unpack::unpack_resource_types;
use starknet::ContractAddress;
use traits::Into;

use eternum::utils::math::min;
use eternum::models::config::{TickConfig, TickImpl};

const LOYALTY_TICK_INTERVAL: u64 = 7; // updates after x ticks
const LOYALTY_PER_TICK_INTERVAL: u64 = 1; // update by y after x ticks
const LOYALTY_MAX_VALUE: u64 = 100; 

#[derive(Model, Copy, Drop, Serde)]
struct Loyalty {
    #[key]
    entity_id: u128,
    last_updated_tick: u64
}


#[generate_trait]
impl LoyaltyImpl of LoyaltyTrait {
    fn value(self: Loyalty, tick: TickConfig) -> u64 {
        if self.last_updated_tick == 0 {
            return 0;
        }

        let ticks_passed: u64 = tick.current() - self.last_updated_tick;
        let value: u64 
            = (ticks_passed / LOYALTY_TICK_INTERVAL) * LOYALTY_PER_TICK_INTERVAL;
        return min(value, LOYALTY_MAX_VALUE);
    }
}
