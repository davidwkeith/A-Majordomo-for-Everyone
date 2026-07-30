// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "avspeech-spike",
    platforms: [.macOS(.v13)],
    targets: [
        .target(name: "SpikeCore", path: "Sources/SpikeCore"),
        .executableTarget(
            name: "avspeech-spike",
            dependencies: ["SpikeCore"],
            path: "Sources/avspeech-spike"),
        .testTarget(
            name: "SpikeCoreTests",
            dependencies: ["SpikeCore"],
            path: "Tests/SpikeCoreTests"),
    ]
)
