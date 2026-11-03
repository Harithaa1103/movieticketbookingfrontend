/**
 * CINE MAX Automatic Adjacent-Seat & Flexible Group Selection Engine
 *
 * Implements strict cinema row-bound consecutive adjacent seat selection:
 * - Supports both Single Group and Flexible Multi-Group bookings (e.g. 3 + 1, 3 + 2, 3 + 3, etc.)
 * - Restricts selection strictly to the same row for each group
 * - Prohibits crossing aisle walkways (columns 4 and 12)
 * - Excludes booked and held-by-others seats
 * - Prevents overlapping/duplicate seat allocation across groups
 * - Provides alternative contiguous block suggestions if requested block cannot fit
 * - Supports one-click smart multi-group automatic allocation across rows
 */

export function selectAdjacentSeats({
  startSeat,
  quantity,
  allRowSeats, // Array of seats in this row sorted ascending by seat number
  aisleColIndices = [4, 12],
  seatStatusMap = {},
  currentUserId = null,
  groupNumber = 1,
  excludedSeatIdentifiers = []
}) {
  if (!startSeat || quantity < 1) {
    return { success: false, seats: [], message: 'Please select a starting seat.' };
  }

  const isAvailable = (seat) => {
    if (!seat) return false;
    if (excludedSeatIdentifiers.includes(seat.seatIdentifier)) return false;
    const statusObj = seatStatusMap[seat.seatIdentifier];
    if (!statusObj) return true; // available
    if (statusObj.status === 'booked') return false;
    if (statusObj.status === 'held_by_other') return false;
    return true; // available or held by current user
  };

  const crossesAisle = (colA, colB) => {
    const minCol = Math.min(colA, colB);
    const maxCol = Math.max(colA, colB);
    return aisleColIndices.some((aisle) => aisle >= minCol && aisle < maxCol);
  };

  if (!isAvailable(startSeat)) {
    return {
      success: false,
      seats: [],
      message: 'The selected seat is already occupied or selected for another group.'
    };
  }

  if (quantity === 1) {
    return {
      success: true,
      seats: [{ ...startSeat, group: groupNumber }]
    };
  }

  const rowSeats = [...allRowSeats].sort((a, b) => a.number - b.number);
  const startNum = startSeat.number;

  // Attempt 1: Forward contiguous block [startNum, startNum + quantity - 1]
  const forwardGroup = [];
  let forwardValid = true;

  for (let i = 0; i < quantity; i++) {
    const targetNum = startNum + i;
    const candidateSeat = rowSeats.find((s) => s.number === targetNum);

    if (!candidateSeat || !isAvailable(candidateSeat)) {
      forwardValid = false;
      break;
    }

    if (i > 0 && crossesAisle(startNum + i - 1, targetNum)) {
      forwardValid = false;
      break;
    }

    forwardGroup.push({ ...candidateSeat, group: groupNumber });
  }

  if (forwardValid && forwardGroup.length === quantity) {
    return {
      success: true,
      seats: forwardGroup
    };
  }

  // Attempt 2: Backward contiguous block ending at startSeat (for seats clicked near row/aisle end)
  const backwardGroup = [];
  let backwardValid = true;

  for (let i = 0; i < quantity; i++) {
    const targetNum = startNum - (quantity - 1 - i);
    const candidateSeat = rowSeats.find((s) => s.number === targetNum);

    if (!candidateSeat || !isAvailable(candidateSeat)) {
      backwardValid = false;
      break;
    }

    if (i > 0 && crossesAisle(targetNum - 1, targetNum)) {
      backwardValid = false;
      break;
    }

    backwardGroup.push({ ...candidateSeat, group: groupNumber });
  }

  if (backwardValid && backwardGroup.length === quantity) {
    return {
      success: true,
      seats: backwardGroup
    };
  }

  // Attempt 3: Find any alternative contiguous group in this row that can accommodate `quantity`
  const suggestion = findAlternativeContiguousGroup(
    rowSeats,
    quantity,
    aisleColIndices,
    isAvailable,
    groupNumber
  );

  return {
    success: false,
    seats: [],
    message: `Sorry! ${quantity} consecutive seats are not available together from this position. Please choose another seat.`,
    suggestion
  };
}

/**
 * Helper to scan a row for a valid contiguous block of size Q
 */
export function findAlternativeContiguousGroup(
  rowSeats,
  quantity,
  aisleColIndices,
  isAvailable,
  groupNumber = 1
) {
  for (let startIdx = 0; startIdx <= rowSeats.length - quantity; startIdx++) {
    const candidateGroup = [];
    let valid = true;

    for (let i = 0; i < quantity; i++) {
      const seat = rowSeats[startIdx + i];
      if (!isAvailable(seat)) {
        valid = false;
        break;
      }
      if (i > 0) {
        const prevSeat = rowSeats[startIdx + i - 1];
        if (seat.number !== prevSeat.number + 1) {
          valid = false;
          break;
        }
        if (aisleColIndices.some((a) => a === prevSeat.number)) {
          valid = false;
          break;
        }
      }
      candidateGroup.push({ ...seat, group: groupNumber });
    }

    if (valid && candidateGroup.length === quantity) {
      return candidateGroup;
    }
  }

  return null;
}

/**
 * Smart Multi-Group Auto Allocator
 *
 * Allocates Group 1 starting at `startSeat`.
 * For all subsequent groups, automatically scans the nearest available rows
 * and allocates the closest available contiguous blocks.
 */
export function autoAllocateFlexibleGroups({
  groups, // e.g. [{ groupNumber: 1, size: 3 }, { groupNumber: 2, size: 1 }]
  startSeat,
  allRowsMap, // { 'J': [seats], 'I': [seats], ... }
  rowOrder = ['J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
  aisleColIndices = [4, 12],
  seatStatusMap = {},
  currentUserId = null
}) {
  if (!groups || groups.length === 0 || !startSeat) {
    return { success: false, message: 'Invalid group configuration.' };
  }

  const allocatedSeats = [];
  const allocatedSeatIds = new Set();

  const isSeatAvailable = (seat) => {
    if (!seat) return false;
    if (allocatedSeatIds.has(seat.seatIdentifier)) return false;
    const statusObj = seatStatusMap[seat.seatIdentifier];
    if (!statusObj) return true;
    if (statusObj.status === 'booked' || statusObj.status === 'held_by_other') return false;
    return true;
  };

  // 1. Allocate Group 1 starting from startSeat
  const group1 = groups[0];
  const rowSeats1 = allRowsMap[startSeat.row] || [];
  const g1Result = selectAdjacentSeats({
    startSeat,
    quantity: group1.size,
    allRowSeats: rowSeats1,
    aisleColIndices,
    seatStatusMap,
    currentUserId,
    groupNumber: group1.groupNumber,
    excludedSeatIdentifiers: []
  });

  if (!g1Result.success) {
    return {
      success: false,
      message: `Could not allocate Group 1 (${group1.size} seats) starting at ${startSeat.row}${startSeat.number}: ${g1Result.message}`,
      suggestion: g1Result.suggestion
    };
  }

  // Register Group 1 seats
  g1Result.seats.forEach((s) => {
    allocatedSeats.push(s);
    allocatedSeatIds.add(s.seatIdentifier);
  });

  // If there's only 1 group, we're done
  if (groups.length === 1) {
    return { success: true, seats: allocatedSeats };
  }

  // 2. Order rows by proximity to startSeat.row
  const startRowIndex = rowOrder.indexOf(startSeat.row);
  const sortedRowLetters = [...rowOrder].sort((a, b) => {
    const distA = Math.abs(rowOrder.indexOf(a) - startRowIndex);
    const distB = Math.abs(rowOrder.indexOf(b) - startRowIndex);
    return distA - distB;
  });

  // 3. Allocate subsequent groups
  for (let gIdx = 1; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    let groupAllocated = false;

    // Search sorted rows for a valid contiguous block of size group.size
    for (const rowLetter of sortedRowLetters) {
      const rowSeats = allRowsMap[rowLetter] || [];

      if (group.size === 1) {
        // Find first available seat in this row
        const freeSeat = rowSeats.find((s) => isSeatAvailable(s));
        if (freeSeat) {
          const seatObj = { ...freeSeat, group: group.groupNumber };
          allocatedSeats.push(seatObj);
          allocatedSeatIds.add(seatObj.seatIdentifier);
          groupAllocated = true;
          break;
        }
      } else {
        // Find contiguous block
        const block = findAlternativeContiguousGroup(
          rowSeats,
          group.size,
          aisleColIndices,
          isSeatAvailable,
          group.groupNumber
        );

        if (block && block.length === group.size) {
          block.forEach((s) => {
            allocatedSeats.push(s);
            allocatedSeatIds.add(s.seatIdentifier);
          });
          groupAllocated = true;
          break;
        }
      }
    }

    if (!groupAllocated) {
      return {
        success: false,
        message: `Could not find an available block for Group ${group.groupNumber} (${group.size} seats). Please select individual groups manually.`,
        partialSeats: allocatedSeats
      };
    }
  }

  return {
    success: true,
    seats: allocatedSeats
  };
}
