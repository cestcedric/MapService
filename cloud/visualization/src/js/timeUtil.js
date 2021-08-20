// import moment from 'moment'
// import 'moment-duration-format'

// Use 0.99 Threshold to avoid flickering at full weeks/days
export function durationTemplate () {
  if (this.duration.asYears() >= 0.99) {
    return this.duration.months() >= 1 ? 'Y [years], M [months]' : 'Y [years]'
  } else if (this.duration.asMonths() >= 0.99) {
    return this.duration.weeks() >= 1 ? 'M [months], w [weeks]' : 'M [months]'
  } else if (this.duration.asWeeks() >= 0.99) {
    // moment.duration().days() gets the days (0 - 30) (not in week intervals)
    return this.duration.days() % 7 >= 1 ? 'w [weeks], d [days]' : 'w [weeks]'
  } else if (this.duration.asDays() >= 0.99) {
    return this.duration.hours() >= 1 ? 'd [days], h [hours]' : 'd [days]'
  } else if (this.duration.asHours() >= 0.99) {
    // const isFullHour = this.duration.minutes() === 0 && this.duration.seconds() === 0
    // return isFullHour ? 'h [hours]' : 'hh:mm:ss'
    return 'hh:mm:ss'
  } else if (this.duration.asMinutes() >= 0.99) {
    // const isFullMinute = this.duration.seconds() === 0
    // return isFullMinute ? 'm [minutes]' : 'hh:mm:ss'
    return 'hh:mm:ss'
  } else {
    return 's [seconds]'
  }
}
