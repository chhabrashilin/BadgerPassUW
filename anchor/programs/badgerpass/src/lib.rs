use anchor_lang::prelude::*;

declare_id!("BAdgErPAss111111111111111111111111111111111");

#[program]
pub mod badgerpass {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        title: String,
        timestamp: i64,
        location: String,
        event_id: u64,
    ) -> Result<()> {
        require!(timestamp >= 0, BadgerError::InvalidTimestamp);
        require!(title.len() <= 64, BadgerError::StringTooLong);
        require!(location.len() <= 64, BadgerError::StringTooLong);

        let event = &mut ctx.accounts.event;
        event.organizer = ctx.accounts.organizer.key();
        event.title = title.clone();
        event.timestamp = timestamp;
        event.location = location;
        event.bump = *ctx.bumps.get("event").unwrap();
        event.event_id = event_id;

        emit!(EventCreated {
            event: event.key(),
            organizer: event.organizer,
            title,
            timestamp
        });
        Ok(())
    }

    pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
        let attendance = &mut ctx.accounts.attendance;
        attendance.event = ctx.accounts.event.key();
        attendance.attendee = ctx.accounts.attendee.key();
        attendance.bump = *ctx.bumps.get("attendance").unwrap();
        attendance.checked_in_at = Clock::get()?.unix_timestamp;

        emit!(CheckedIn {
            event: attendance.event,
            attendee: attendance.attendee,
            checked_in_at: attendance.checked_in_at
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, timestamp: i64, location: String, event_id: u64)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,
    /// PDA: ["event", organizer, event_id_le]
    #[account(
        init,
        payer = organizer,
        space = 8 + Event::MAX_SIZE,
        seeds = [b"event", organizer.key().as_ref(), &event_id.to_le_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckIn<'info> {
    /// The attendee must sign
    pub attendee: Signer<'info>,
    /// Event must exist
    pub event: Account<'info, Event>,
    /// PDA: ["attendance", event, attendee]
    #[account(
        init,
        payer = attendee,
        space = 8 + Attendance::MAX_SIZE,
        seeds = [b"attendance", event.key().as_ref(), attendee.key().as_ref()],
        bump
    )]
    pub attendance: Account<'info, Attendance>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub title: String,
    pub timestamp: i64,
    pub location: String,
    pub bump: u8,
    pub event_id: u64,
}

impl Event {
    // organizer: 32
    // title: 4 + 64
    // timestamp: 8
    // location: 4 + 64
    // bump: 1
    // event_id: 8
    pub const MAX_SIZE: usize = 32 + (4 + 64) + 8 + (4 + 64) + 1 + 8;
}

#[account]
pub struct Attendance {
    pub event: Pubkey,
    pub attendee: Pubkey,
    pub checked_in_at: i64,
    pub bump: u8,
}

impl Attendance {
    // event: 32
    // attendee: 32
    // checked_in_at: 8
    // bump: 1
    pub const MAX_SIZE: usize = 32 + 32 + 8 + 1;
}

#[error_code]
pub enum BadgerError {
    #[msg("Timestamp must be non-negative")]
    InvalidTimestamp,
    #[msg("String exceeds allowed length")]
    StringTooLong,
}

#[event]
pub struct EventCreated {
    pub event: Pubkey,
    pub organizer: Pubkey,
    pub title: String,
    pub timestamp: i64,
}

#[event]
pub struct CheckedIn {
    pub event: Pubkey,
    pub attendee: Pubkey,
    pub checked_in_at: i64,
}


