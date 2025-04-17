// import React, { useState } from 'react';
// import { Calendar } from '@/components/ui/calendar';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Car } from '@/types/booking';
// import { addDays } from 'date-fns';
// import { Badge } from '@/components/ui/badge';

// interface BookingCalendarProps {
//   cars: Car[];
// }

// const BookingCalendar: React.FC<BookingCalendarProps> = ({ cars }) => {
//   const [selectedCar, setSelectedCar] = useState<string | undefined>();
//   const [month, setMonth] = useState<Date>(new Date());

//   // Generate some mock bookings
//   const getBookedDays = (carId?: string) => {
//     if (!carId) return [];
    
//     // In a real app, these would come from the database
//     // For now, generate some random bookings
//     const bookings = [];
//     const car = cars.find(c => c.id === carId);
//     if (!car) return [];

//     // Add example booking 1
//     const start1 = addDays(new Date(), Math.floor(Math.random() * 7) + 1);
//     const end1 = addDays(start1, Math.floor(Math.random() * 5) + 1);
//     bookings.push({ start: start1, end: end1, name: car.carName });

//     // Add example booking 2
//     const start2 = addDays(end1, Math.floor(Math.random() * 7) + 3);
//     const end2 = addDays(start2, Math.floor(Math.random() * 5) + 1);
//     bookings.push({ start: start2, end: end2, name: car.carName });

//     return bookings;
//   };

//   const bookedDays = getBookedDays(selectedCar);

//   // Handle date rendering in calendar
//   const renderDay = (day: Date) => {
//     const isBooked = bookedDays.some(booking => 
//       day >= booking.start && day <= booking.end
//     );

//     if (isBooked) {
//       return <Badge className="bg-red-500">Booked</Badge>;
//     }

//     return day.getDate();
//   };

//   return (
//     <div>
//       <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
//         <h2 className="text-3xl font-bold text-gray-800">Booking Calendar</h2>
//         <div className="min-w-[200px]">
//           <Select value={selectedCar} onValueChange={setSelectedCar}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select a car" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="">All Cars</SelectItem>
//               {cars.map(car => (
//                 <SelectItem key={car.id} value={car.id}>
//                   {car.carName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>
//               Available Dates for {selectedCar ? cars.find(c => c.id === selectedCar)?.carName : 'All Cars'}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Calendar 
//               mode="single"
//               month={month}
//               onMonthChange={setMonth}
//               className="rounded-md border"
//               components={{
//                 Day: ({ date }) => renderDay(date),
//               }}
//             />
//           </CardContent>
//         </Card>
        
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Booking Legend</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2">
//                   <div className="h-4 w-4 rounded-full bg-green-500"></div>
//                   <span>Available</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="h-4 w-4 rounded-full bg-red-500"></div>
//                   <span>Booked</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
//                   <span>Maintenance</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Current Bookings</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {bookedDays.length > 0 ? (
//                   bookedDays.map((booking, index) => (
//                     <div key={index} className="border p-3 rounded-md">
//                       <p className="font-medium">{booking.name}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {booking.start.toLocaleDateString()} - {booking.end.toLocaleDateString()}
//                       </p>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-muted-foreground">
//                     {selectedCar 
//                       ? "No current bookings for this car" 
//                       : "Select a car to see bookings"}
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingCalendar;