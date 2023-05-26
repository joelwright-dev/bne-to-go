import Foodtruck from "../../components/Foodtruck"
import { Grid, Select, Text } from "@mantine/core"
import prisma from "../../lib/prisma"
import { useState } from "react"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export async function getServerSideProps(context) {
    const res = await fetch("https://www.bnefoodtrucks.com.au/api/1/trucks")
    const foodTruckData = await res.json()

    const reviews = await prisma.review.groupBy({
        by: ['truckId'],
        _avg: {
            rating: true
        }
    })

    const cuisines = [{
        value: "", label: "Any"
    }]

    foodTruckData.forEach((truck) => {
        const cuisine = {
            value: truck.category, label: truck.category
        }

        if(cuisines.find(c => c.value == truck.category) == undefined && !truck.category == "") {
            cuisines.push({
                value: truck.category, label: truck.category
            })
        }
    })

    console.log(cuisines)

    const foodTrucks = foodTruckData.map((truck) => {
        const rating = reviews.find((review) => review.truckId == truck.truck_id)

        if(rating == undefined) {
            return({
                id: truck.truck_id,
                image: truck.cover_photo.src,
                title: truck.name,
                description: truck.bio,
                category: truck.category,
                rating: 0
            })
        } else {
            return({
                id: truck.truck_id,
                image: truck.cover_photo.src,
                title: truck.name,
                description: truck.bio,
                category: truck.category,
                rating: rating._avg.rating
            })
        }
    })

    return {
        props: {
            foodTrucks: JSON.parse(JSON.stringify(foodTrucks)),
            cuisines
        }
    }
}

export default function Home({ foodTrucks, cuisines }) {
    const [ratingFilter, setRatingFilter] = useState("")
    const [cuisineFilter, setCuisineFilter] = useState("")
    const [orderBy, setOrderBy] = useState("")

    if(orderBy !== "") {
        console.log(foodTrucks.sort((a, b) => b.rating - a.rating))
    }
    
    return (
        <Grid>
            <Grid.Col span={4}>
                <Select
                    label="Order by"
                    placeholder="Pick one"
                    data={[
                        { value: "", label: "None" },
                        { value: "rating", label: "Rating" }
                    ]}
                    value={orderBy}
                    onChange={setOrderBy}
                />
            </Grid.Col>
            <Grid.Col span={4}>
                <Select
                    label="Cuisine"
                    placeholder="Pick one"
                    data={cuisines}
                    value={cuisineFilter}
                    onChange={setCuisineFilter}
                />
            </Grid.Col>
            <Grid.Col span={4}>
                <Select
                    label="Rating"
                    placeholder="Pick one"
                    data={[
                        { label: "Any", value: ""},
                        { label: "4-5 stars", value: "4,5" },
                        { label: "3-4 stars", value: "3,4" },
                        { label: "2-3 stars", value: "2,3" },
                        { label: "1-2 stars", value: "1,2" },
                    ]}
                    value={ratingFilter}
                    onChange={setRatingFilter}
                />
            </Grid.Col>
            {foodTrucks.map(foodTruck => {

                if(cuisineFilter == "" && ratingFilter == "") {
                    return (
                        <Grid.Col md={6} sm={12} key={foodTruck.id}>
                            <Foodtruck id={foodTruck.id} image={foodTruck.image} title={foodTruck.title} rating={foodTruck.rating} description={foodTruck.description} category={foodTruck.category}/>
                        </Grid.Col>
                    )
                } else if (cuisineFilter == foodTruck.category && ratingFilter == "") {
                    return (
                        <Grid.Col md={6} sm={12} key={foodTruck.id}>
                            <Foodtruck id={foodTruck.id} image={foodTruck.image} title={foodTruck.title} rating={foodTruck.rating} description={foodTruck.description} category={foodTruck.category}/>
                        </Grid.Col>
                    )
                } else if (cuisineFilter == foodTruck.category && parseInt(ratingFilter[0]) <= (foodTruck.rating) && (foodTruck.rating) <= parseInt(ratingFilter[2])) {
                    return (
                        <Grid.Col md={6} sm={12} key={foodTruck.id}>
                            <Foodtruck id={foodTruck.id} image={foodTruck.image} title={foodTruck.title} rating={foodTruck.rating} description={foodTruck.description} category={foodTruck.category}/>
                        </Grid.Col>
                    )
                } else if (cuisineFilter == "" && parseInt(ratingFilter[0]) <= (foodTruck.rating) && (foodTruck.rating) <= parseInt(ratingFilter[2])) {
                    return (
                        <Grid.Col md={6} sm={12} key={foodTruck.id}>
                            <Foodtruck id={foodTruck.id} image={foodTruck.image} title={foodTruck.title} rating={foodTruck.rating} description={foodTruck.description} category={foodTruck.category}/>
                        </Grid.Col>
                    )
                }
            })}
        </Grid>
    )
}