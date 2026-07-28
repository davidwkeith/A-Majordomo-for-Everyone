// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "avspeech-spike",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(name: "avspeech-spike", path: "Sources/avspeech-spike")
    ]
)
