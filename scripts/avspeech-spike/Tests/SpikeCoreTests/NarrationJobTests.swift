import XCTest
@testable import SpikeCore

final class NarrationJobTests: XCTestCase {
    func testJobRoundTripsThroughJSON() throws {
        let job = NarrationJob(
            audioOutput: "/tmp/ch.m4a",
            segments: [NarrationSegment(
                voiceId: "com.apple.voice.enhanced.en-US.Nathan",
                text: "HUD sent a letter.",
                ipa: [IpaRange(start: 0, length: 3, notation: "hʌd")])])
        let data = try JSONEncoder().encode(job)
        let decoded = try JSONDecoder().decode(NarrationJob.self, from: data)
        XCTAssertEqual(decoded.segments[0].ipa[0].notation, "hʌd")
        XCTAssertEqual(decoded.audioOutput, "/tmp/ch.m4a")
    }

    func testMarkerSecondsConvertsNativeBytesAndAddsAccumulated() {
        // 44100 Hz float32 mono: 4 bytes/frame. 88200 bytes = 22050 frames = 0.5 s.
        let s = markerSeconds(byteOffset: 88_200, bytesPerFrame: 4, sampleRate: 44_100, accumulatedSeconds: 10.0)
        XCTAssertEqual(s, 10.5, accuracy: 1e-9)
    }

    func testHasSpeakableContent() {
        XCTAssertTrue(hasSpeakableContent("Hello."))
        XCTAssertTrue(hasSpeakableContent("… 42 …"))
        XCTAssertFalse(hasSpeakableContent(" — … \n\n"))
        XCTAssertFalse(hasSpeakableContent(""))
    }
}
