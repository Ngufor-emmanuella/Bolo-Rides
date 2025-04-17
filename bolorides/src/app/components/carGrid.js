// import React from 'react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Car } from '@/types/booking';
// import { Calendar, Info, Check } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';

// interface CarGridProps {
//   cars: Car[];
//   isLoading: boolean;
//   onCarSelect: (car: Car) => void;
//   selectedCar: Car | null;
// }

// const CarGrid: React.FC<CarGridProps> = ({ cars, isLoading, onCarSelect, selectedCar }) => {
//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[...Array(6)].map((_, i) => (
//           <Card key={i} className="overflow-hidden">
//             <CardHeader className="p-0">
//               <Skeleton className="h-48 w-full" />
//             </CardHeader>
//             <CardContent className="p-6">
//               <Skeleton className="h-6 w-3/4 mb-4" />
//               <Skeleton className="h-4 w-full mb-2" />
//               <Skeleton className="h-4 w-2/3" />
//             </CardContent>
//             <CardFooter className="px-6 pb-6 pt-0 flex justify-between">
//               <Skeleton className="h-10 w-28" />
//               <Skeleton className="h-10 w-28" />
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2 className="text-3xl font-bold mb-6 text-gray-800">Available Cars</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {cars.length > 0 ? (
//           cars.map((car) => (
//             <Card 
//               key={car.id} 
//               className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${selectedCar?.id === car.id ? 'ring-2 ring-purple-500' : ''}`}
//             >
//               <CardHeader className="p-0">
//                 <div className="h-48 bg-gray-200 relative">
//                   <img
//                     src={car.imageUrl || "https://placehold.co/600x400?text=Car+Image"} 
//                     alt={car.carName}
//                     className="w-full h-full object-cover"
//                   />
//                   <Badge 
//                     className={`absolute top-4 right-4 ${
//                       car.status === 'available' ? 'bg-green-500' : 
//                       car.status === 'rented' ? 'bg-red-500' : 
//                       'bg-yellow-500'
//                     }`}
//                   >
//                     {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
//                   </Badge>
//                   {car.rentedUntil && car.status === 'rented' && (
//                     <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs py-1 px-2 rounded-md flex items-center">
//                       <Calendar className="h-3 w-3 mr-1" />
//                       <span>Until {car.rentedUntil}</span>
//                     </div>
//                   )}
//                 </div>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <CardTitle className="mb-2">{car.carName}</CardTitle>
//                 <p className="text-gray-500 mb-2">{car.carType}</p>
//                 <div className="flex flex-wrap gap-2 mt-4">
//                   {car.features?.map((feature, idx) => (
//                     <Badge key={idx} variant="outline" className="flex items-center gap-1">
//                       <Check className="h-3 w-3" /> {feature}
//                     </Badge>
//                   ))}
//                 </div>
//               </CardContent>
//               <CardFooter className="px-6 pb-6 pt-0 flex justify-between">
//                 <Button 
//                   variant="outline"
//                   onClick={() => onCarSelect(car)} 
//                   disabled={car.status !== 'available'}
//                 >
//                   <Info className="mr-2 h-4 w-4" /> Details
//                 </Button>
//                 <Button
//                   onClick={() => onCarSelect(car)}
//                   disabled={car.status !== 'available'}
//                 >
//                   Book Now
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))
//         ) : (
//           <div className="col-span-full text-center py-12">
//             <h3 className="text-xl font-medium text-gray-500">No cars available at the moment</h3>
//             <p className="mt-2 text-gray-400">Please check back later</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CarGrid;
