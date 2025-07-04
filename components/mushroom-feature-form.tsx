"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import {
    MouseIcon as Mushroom,
    Eye,
    Palette,
    Layers,
    TreePine,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Loader2,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Toaster } from "./ui/sonner"

const mushroomFeatures = {
    "cap-shape": ["bell", "conical", "convex", "flat", "knobbed", "sunken"],
    "cap-surface": ["fibrous", "grooves", "scaly", "smooth"],
    "cap-color": ["brown", "buff", "cinnamon", "gray", "green", "pink", "purple", "red", "white", "yellow"],
    bruises: ["bruises", "no"],
    odor: ["almond", "anise", "creosote", "fishy", "foul", "musty", "none", "pungent", "spicy"],
    "gill-attachment": ["attached", "descending", "free", "notched"],
    "gill-spacing": ["close", "crowded", "distant"],
    "gill-size": ["broad", "narrow"],
    "gill-color": [
        "black",
        "brown",
        "buff",
        "chocolate",
        "gray",
        "green",
        "orange",
        "pink",
        "purple",
        "red",
        "white",
        "yellow",
    ],
    "stalk-shape": ["enlarging", "tapering"],
    "stalk-root": ["bulbous", "club", "cup", "equal", "rhizomorphs", "rooted", "missing"],
    "stalk-surface-above-ring": ["fibrous", "scaly", "silky", "smooth"],
    "stalk-surface-below-ring": ["fibrous", "scaly", "silky", "smooth"],
    "stalk-color-above-ring": ["brown", "buff", "cinnamon", "gray", "orange", "pink", "red", "white", "yellow"],
    "stalk-color-below-ring": ["brown", "buff", "cinnamon", "gray", "orange", "pink", "red", "white", "yellow"],
    "veil-type": ["partial"],
    "veil-color": ["brown", "orange", "white", "yellow"],
    "ring-number": ["none", "one", "two"],
    "ring-type": ["cobwebby", "evanescent", "flaring", "large", "none", "pendant", "sheathing", "zone"],
    "spore-print-color": ["black", "brown", "buff", "chocolate", "green", "orange", "purple", "white", "yellow"],
    population: ["abundant", "clustered", "numerous", "scattered", "several", "solitary"],
    habitat: ["grasses", "leaves", "meadows", "paths", "urban", "waste", "woods"],
}

const featureGroups = [
    {
        title: "Cap Characteristics",
        icon: <Mushroom className="w-5 h-5" />,
        features: ["cap-shape", "cap-surface", "cap-color"],
    },
    {
        title: "Physical Properties",
        icon: <Eye className="w-5 h-5" />,
        features: ["bruises", "odor"],
    },
    {
        title: "Gill Features",
        icon: <Layers className="w-5 h-5" />,
        features: ["gill-attachment", "gill-spacing", "gill-size", "gill-color"],
    },
    {
        title: "Stalk Properties",
        icon: <TreePine className="w-5 h-5" />,
        features: [
            "stalk-shape",
            "stalk-root",
            "stalk-surface-above-ring",
            "stalk-surface-below-ring",
            "stalk-color-above-ring",
            "stalk-color-below-ring",
        ],
    },
    {
        title: "Veil & Ring",
        icon: <Palette className="w-5 h-5" />,
        features: ["veil-type", "veil-color", "ring-number", "ring-type"],
    },
    {
        title: "Spores & Environment",
        icon: <MapPin className="w-5 h-5" />,
        features: ["spore-print-color", "population", "habitat"],
    },
]

function formatFeatureName(feature: string): string {
    return feature
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

function formatOptionName(option: string): string {
    return option.charAt(0).toUpperCase() + option.slice(1)
}

export default function MushroomFeatureForm() {
    const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string>>({})
    const [completedGroups, setCompletedGroups] = useState<Set<string>>(new Set())
    const [prediction, setPrediction] = useState<string | null>(null)
    const [isClassifying, setIsClassifying] = useState(false)


    const handleFeatureChange = (feature: string, value: string) => {
        const newFeatures = { ...selectedFeatures, [feature]: value }
        setSelectedFeatures(newFeatures)

        // Check if group is completed
        featureGroups.forEach((group) => {
            const groupComplete = group.features.every((f) => newFeatures[f])
            if (groupComplete) {
                setCompletedGroups((prev) => new Set([...prev, group.title]))
            } else {
                setCompletedGroups((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(group.title)
                    return newSet
                })
            }
        })
    }

    const handleSubmit = async () => {
        const allFeatures = Object.keys(mushroomFeatures)
        const missingFields = allFeatures.filter((f) => !selectedFeatures[f])

        if (missingFields.length > 0) {
            const formatted = missingFields.map(formatFeatureName).join(", ")
            toast.error(`Please fill all fields. Missing: ${formatted}`)
            return
        }

        setIsClassifying(true)
        setPrediction(null)

        try {
            const call = await fetch('https://mushroom-backend-fqwe.onrender.com/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedFeatures),
            })

            const item = await call.json()
            console.log("API Response:", item)

            if (item && item.predicted_class) {

                setPrediction(item.predicted_class)

            } else {
                setPrediction("Unknown")
            }
        } catch (error) {
            console.error("Prediction error:", error)
            toast.error("Prediction failed. Please try again.")
            setPrediction("Error")
        } finally {
            setIsClassifying(false)
        }
    }

    const totalFeatures = Object.keys(mushroomFeatures).length
    const selectedCount = Object.keys(selectedFeatures).length
    const progressPercentage = (selectedCount / totalFeatures) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <Toaster position="top-right" richColors /> {/* ✅ Toast added here */}
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Mushroom className="w-8 h-8 text-emerald-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Mushroom Classifier</h1>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">
                        Select the characteristics of your mushroom to help identify its species
                    </p>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>
                                {selectedCount}/{totalFeatures} features
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Feature Groups */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {featureGroups.map((group) => (
                        <Card key={group.title} className="relative overflow-hidden">
                            {completedGroups.has(group.title) && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                        Complete
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {group.icon}
                                    {group.title}
                                </CardTitle>
                                <CardDescription>Select the characteristics for {group.title.toLowerCase()}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {group.features.map((feature) => (
                                    <div key={feature} className="space-y-2">
                                        <Label htmlFor={feature} className="text-sm font-medium">
                                            {formatFeatureName(feature)}
                                        </Label>
                                        <Select
                                            value={selectedFeatures[feature] || ""}
                                            onValueChange={(value) => handleFeatureChange(feature, value)}
                                        >
                                            <SelectTrigger id={feature}>
                                                <SelectValue placeholder={`Select ${formatFeatureName(feature).toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mushroomFeatures[feature as keyof typeof mushroomFeatures].map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {formatOptionName(option)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Selected Features Summary */}
                {selectedCount > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Selected Features Summary
                            </CardTitle>
                            <CardDescription>Review your mushroom characteristics before classification</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(selectedFeatures).map(([feature, value]) => (
                                    <div key={feature} className="flex flex-col space-y-1">
                                        <span className="text-sm font-medium text-gray-600">{formatFeatureName(feature)}</span>
                                        <Badge variant="outline" className="w-fit">
                                            {formatOptionName(value)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Prediction Result */}
                {(prediction || isClassifying) && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {isClassifying ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : prediction === "poisonous" ? (
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                                Classification Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isClassifying ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                                    <p className="text-lg font-medium">Analyzing mushroom characteristics...</p>
                                    <p className="text-sm text-gray-600 mt-2">This may take a few moments</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Alert
                                        className={prediction === "poisonous" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
                                    >
                                        <div className="flex items-center gap-3">
                                            {prediction === "poisonous" ? (
                                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                            ) : (
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            )}
                                            <div className="flex-1">
                                                <AlertTitle
                                                    className={`text-lg  w-full ${prediction === "poisonous" ? "text-red-800" : "text-green-800"} whitespace-normal break-words !line-clamp-none`}
                                                >
                                                    <span className="font-bold">Prediction</span>: {prediction}
                                                </AlertTitle>




                                            </div>
                                        </div>
                                    </Alert>

                                    {prediction === "poisonous" && (
                                        <Alert className="border-red-300 bg-red-100">
                                            <AlertTriangle className="w-4 h-4 text-red-600" />
                                            <AlertTitle className="text-red-800">⚠️ Safety Warning</AlertTitle>
                                            <AlertDescription className="text-red-700">
                                                <strong>DO NOT CONSUME</strong> this mushroom. This classification suggests the mushroom may be
                                                toxic. Always consult with a mycologist or expert before consuming any wild mushrooms.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {prediction === "edible" && (
                                        <Alert className="border-amber-300 bg-amber-50">
                                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            <AlertTitle className="text-amber-800">⚠️ Important Notice</AlertTitle>
                                            <AlertDescription className="text-amber-700">
                                                While this classification suggests the mushroom may be edible,{" "}
                                                <strong>never consume wild mushrooms</strong> without expert identification. This tool is for
                                                educational purposes only.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setPrediction(null)

                                            }}
                                        >
                                            Clear Result
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedFeatures({})
                                                setPrediction(null)

                                                setCompletedGroups(new Set())
                                            }}
                                        >
                                            Start Over
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                <div className="mt-8 text-center">
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                        disabled={selectedCount === 0 || isClassifying}
                    >
                        {isClassifying ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Classifying...
                            </>
                        ) : (
                            <>
                                <Mushroom className="w-5 h-5 mr-2" />
                                Classify Mushroom
                                {selectedCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 bg-white text-emerald-700">
                                        {selectedCount}
                                    </Badge>
                                )}
                            </>
                        )}
                    </Button>

                    {selectedCount < totalFeatures && (
                        <p className="text-sm text-gray-500 mt-2">
                            Fill in more characteristics for better classification accuracy
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
