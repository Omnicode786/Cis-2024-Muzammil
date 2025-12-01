import React, { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCircuitStore } from '../../store/circuitStore';
import { ComponentNode } from './ComponentNode';
import { WireNode } from './WireNode';
import { v4 as uuidv4 } from 'uuid';
import { Component, ComponentType } from '../../types/circuit';

export const CircuitCanvas: React.FC = () => {
    const { components, wires, addComponent, updateComponent, updateWireState, addWire } = useCircuitStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [wiringSource, setWiringSource] = useState<{ componentId: string; pinId: string; x: number; y: number } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const stageRef = useRef<any>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleMouseMove = (e: any) => {
        const stage = e.target.getStage();
        if (stage) {
            const pointerPosition = stage.getPointerPosition();
            if (pointerPosition) {
                setMousePos(pointerPosition);
            }
        }
    };

    const handlePinClick = (componentId: string, pinId: string, type: 'input' | 'output', x: number, y: number) => {
        if (!wiringSource) {
            setWiringSource({ componentId, pinId, x, y });
        } else {
            if (wiringSource.componentId !== componentId && wiringSource.pinId !== pinId) {
                addWire(wiringSource.pinId, pinId);
            }
            setWiringSource(null);
        }
    };

    const handleStageClick = (e: any) => {
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
            setWiringSource(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        stageRef.current.setPointersPositions(e);
        const stage = stageRef.current.getStage();
        const pointerPosition = stage.getPointerPosition();

        const type = e.dataTransfer.getData('componentType') as ComponentType;
        if (type) {
            const inputs = [];
            const outputs = [];

            if (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(type)) {
                inputs.push({ id: uuidv4(), componentId: '', type: 'input', relativePosition: { x: 0, y: 20 }, value: false });
                inputs.push({ id: uuidv4(), componentId: '', type: 'input', relativePosition: { x: 0, y: 40 }, value: false });
                outputs.push({ id: uuidv4(), componentId: '', type: 'output', relativePosition: { x: 60, y: 30 }, value: false });
            } else if (type === 'NOT') {
                inputs.push({ id: uuidv4(), componentId: '', type: 'input', relativePosition: { x: 0, y: 30 }, value: false });
                outputs.push({ id: uuidv4(), componentId: '', type: 'output', relativePosition: { x: 60, y: 30 }, value: false });
            } else if (type === 'INPUT_SWITCH') {
                outputs.push({ id: uuidv4(), componentId: '', type: 'output', relativePosition: { x: 40, y: 20 }, value: false });
            } else if (type === 'OUTPUT_LED') {
                inputs.push({ id: uuidv4(), componentId: '', type: 'input', relativePosition: { x: 0, y: 20 }, value: false });
            } else if (type === 'CLOCK') {
                outputs.push({ id: uuidv4(), componentId: '', type: 'output', relativePosition: { x: 40, y: 20 }, value: false });
            } else if (type === 'D_FLIPFLOP') {
                inputs.push({ id: uuidv4(), componentId: '', type: 'input', relativePosition: { x: 0, y: 20 }, value: false }); // Clock
                inputs.push({ id: uuidv4(), componentId: '', type: 'input', relativePosition: { x: 0, y: 80 }, value: false }); // D
                outputs.push({ id: uuidv4(), componentId: '', type: 'output', relativePosition: { x: 100, y: 20 }, value: false }); // Q
                outputs.push({ id: uuidv4(), componentId: '', type: 'output', relativePosition: { x: 100, y: 80 }, value: false }); // Q_not
            }

            const newComponent: Component = {
                id: uuidv4(),
                type,
                x: pointerPosition.x,
                y: pointerPosition.y,
                rotation: 0,
                inputs,
                outputs,
                state: { isOn: false },
            };

            newComponent.inputs.forEach(p => p.componentId = newComponent.id);
            newComponent.outputs.forEach(p => p.componentId = newComponent.id);

            addComponent(newComponent);
        }
    };

    return (
        <div
            className="flex-1 bg-gray-100 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Stage
                width={window.innerWidth - 250}
                height={window.innerHeight}
                draggable
                ref={stageRef}
                onMouseMove={handleMouseMove}
                onClick={handleStageClick}
            >
                <Layer>
                    {Object.values(wires).map((wire) => (
                        <WireNode key={wire.id} wire={wire} components={components} />
                    ))}

                    {wiringSource && (
                        <WireNode
                            wire={{
                                id: 'temp',
                                sourcePinId: wiringSource.pinId,
                                targetPinId: 'temp-target',
                                color: '#4299e1',
                                state: false
                            }}
                            components={{
                                ...components,
                                'temp-comp': {
                                    id: 'temp-comp',
                                    type: 'AND', // Dummy
                                    x: mousePos.x,
                                    y: mousePos.y,
                                    rotation: 0,
                                    inputs: [{ id: 'temp-target', componentId: 'temp-comp', type: 'input', relativePosition: { x: 0, y: 0 }, value: false }],
                                    outputs: [],
                                    state: {}
                                }
                            }}
                        />
                    )}

                    {Object.values(components).map((comp) => (
                        <ComponentNode
                            key={comp.id}
                            component={comp}
                            isSelected={selectedId === comp.id}
                            onSelect={setSelectedId}
                            onDragMove={(id, x, y) => updateComponent(id, { x, y })}
                            onPinClick={handlePinClick}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};
